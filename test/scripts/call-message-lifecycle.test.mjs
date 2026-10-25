/**
 * Exercise the real Android call-message callback and call-record registry on
 * the JVM. Requires Node.js and a JDK; no Android SDK, Gradle, emulator or network.
 *
 * Android/React Native/Twilio boundary objects and the serializer bridge below
 * are explicit test doubles. The serializer double retains the production
 * UUID/native-Call assertions; this does not test full native serialization.
 *
 * Run: node --test test/scripts/call-message-lifecycle.test.mjs
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const temporary = mkdtempSync(join(tmpdir(), 'twilio-call-message-'));
const source = join(temporary, 'src');
const classes = join(temporary, 'classes');
const binary = (name) =>
  process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', name) : name;
const fixtures = {
  'com/twiliovoicereactnative/ReactNativeArgumentsSerializer.java':
    'package com.twiliovoicereactnative; import com.facebook.react.bridge.WritableMap; import com.twilio.voice.*; import java.util.Objects; class ReactNativeArgumentsSerializer { static WritableMap serializeCall(CallRecordDatabase.CallRecord r){ Objects.requireNonNull(r.getUuid()); Objects.requireNonNull(r.getVoiceCall()); WritableMap m=new WritableMap();m.put("uuid",r.getUuid().toString());m.put("sid",r.getVoiceCall().getSid());return m;} static WritableMap serializeCallMessage(CallMessage m){return new WritableMap();} static WritableMap serializeVoiceException(VoiceException e){return new WritableMap();} }',
  'com/twiliovoicereactnative/CommonConstants.java':
    'package com.twiliovoicereactnative; class CommonConstants {static final String CallEventMessageFailure="CallEventMessageFailure";static final String CallEventMessageReceived="CallEventMessageReceived";static final String CallEventMessageSent="CallEventMessageSent";static final String CallInviteEventKeyCallSid="CallInviteEventKeyCallSid";static final String ScopeCall="ScopeCall";static final String ScopeCallInvite="ScopeCallInvite";static final String ScopeCallMessage="ScopeCallMessage";static final String VoiceErrorKeyError="VoiceErrorKeyError";static final String VoiceEventSid="VoiceEventSid";static final String VoiceEventType="VoiceEventType";static final String JSEventKeyCallMessageInfo="JSEventKeyCallMessageInfo";}',
  'com/twiliovoicereactnative/ModuleProxy.java':
    'package com.twiliovoicereactnative; class ModuleProxy { interface UniversalPromise {} }',
  'com/twiliovoicereactnative/SDKLog.java':
    'package com.twiliovoicereactnative; class SDKLog { SDKLog(Class<?> c){} void debug(String s){} void warning(String s){} }',
  'com/twiliovoicereactnative/Constants.java':
    'package com.twiliovoicereactnative; class Constants { static final String JS_EVENT_KEY_CALL_INFO="callInfo"; }',
  'com/twiliovoicereactnative/JSEventEmitter.java':
    'package com.twiliovoicereactnative; import android.util.Pair; import com.facebook.react.bridge.WritableMap; class JSEventEmitter { final java.util.List<String> scopes=new java.util.ArrayList<>(); final java.util.List<WritableMap> events=new java.util.ArrayList<>(); static WritableMap constructJSMap(Pair<String,?>... pairs){WritableMap m=new WritableMap();for(Pair<String,?> p:pairs)m.put(p.first,p.second);return m;} void sendEvent(String scope,WritableMap map){scopes.add(scope);events.add(map);} }',
  'com/twiliovoicereactnative/CallMessageRegression.java':
    'package com.twiliovoicereactnative;\nimport java.util.*; import com.twilio.voice.*; import com.facebook.react.bridge.WritableMap;\npublic class CallMessageRegression {\n static int passed=0,failed=0; static String selected=null; static CallMessageListenerProxy listener; static CallMessage message=new CallMessage();\n static CallRecordDatabase db(){return VoiceApplicationProxy.db;} static JSEventEmitter emitter(){return VoiceApplicationProxy.emitter;}\n static void check(boolean b,String m){if(!b)throw new AssertionError(m);}\n static void test(String name,Runnable body){if(selected!=null && !selected.equals(name))return;VoiceApplicationProxy.reset();listener=new CallMessageListenerProxy();try{body.run();passed++;System.out.println("PASS "+name);}catch(Throwable e){failed++;System.out.println("FAIL "+name+" "+e.getClass().getSimpleName());}}\n static CallRecordDatabase.CallRecord addCall(String sid){CallRecordDatabase.CallRecord r=new CallRecordDatabase.CallRecord(UUID.randomUUID(),new Call(sid),"test",new HashMap<>(),CallRecordDatabase.CallRecord.Direction.OUTGOING,null);db().add(r);return r;}\n static CallRecordDatabase.CallRecord invite(String sid){CallRecordDatabase.CallRecord r=new CallRecordDatabase.CallRecord(UUID.randomUUID(),new CallInvite(sid));db().add(r);return r;}\n public static void main(String[] args){selected=args.length>0?args[0]:null;\n  test("valid outgoing message preserves call identity",()->{var r=addCall("CA_A");listener.onMessageReceived("CA_A",message);check(emitter().events.size()==1,"one event");check(emitter().scopes.get(0).equals(CommonConstants.ScopeCall),"call route");var info=(WritableMap)emitter().events.get(0).get(Constants.JS_EVENT_KEY_CALL_INFO);check(info.get("uuid").equals(r.getUuid().toString()),"same UUID");});\n  test("unknown SID does not crash or emit",()->{listener.onMessageReceived("CA_UNKNOWN",message);check(emitter().events.isEmpty(),"no misrouted event");});\n  test("late message after actual record removal preserves other call",()->{var a=addCall("CA_A");addCall("CA_B");db().remove(a);listener.onMessageReceived("CA_A",message);check(emitter().events.isEmpty(),"late A dropped");listener.onMessageReceived("CA_B",message);check(emitter().events.size()==1,"valid B delivered");var info=(WritableMap)emitter().events.get(0).get(Constants.JS_EVENT_KEY_CALL_INFO);check(info.get("sid").equals("CA_B"),"B identity preserved");});\n  test("null SID does not crash",()->{addCall("CA_B");listener.onMessageReceived(null,message);check(emitter().events.isEmpty(),"invalid SID dropped");});\n  test("empty SID does not crash",()->{listener.onMessageReceived("",message);check(emitter().events.isEmpty(),"invalid SID dropped");});\n  test("active invite retains invite route without native Call",()->{invite("CA_INVITE");listener.onMessageReceived("CA_INVITE",message);check(emitter().events.size()==1,"invite delivered");check(emitter().scopes.get(0).equals(CommonConstants.ScopeCallInvite),"invite route");check(emitter().events.get(0).get(Constants.JS_EVENT_KEY_CALL_INFO)==null,"no call serialization");check(emitter().events.get(0).get(CommonConstants.CallInviteEventKeyCallSid).equals("CA_INVITE"),"invite SID preserved");});\n  test("accepted invite before native Call population does not crash",()->{var r=invite("CA_ACCEPTING");r.setCallInviteUsedState();listener.onMessageReceived("CA_ACCEPTING",message);check(emitter().events.isEmpty(),"incomplete call not serialized");});\n  test("record without UUID does not reach asserting serializer",()->{db().add(new CallRecordDatabase.CallRecord(null,new Call("CA_NO_UUID"),"test",new HashMap<>(),CallRecordDatabase.CallRecord.Direction.OUTGOING,null));listener.onMessageReceived("CA_NO_UUID",message);check(emitter().events.isEmpty(),"invalid call not serialized");});\n  test("invite transition uses one routing snapshot",()->{var r=new CallRecordDatabase.CallRecord(UUID.randomUUID(),new CallInvite("CA_TRANSITION")){@Override public CallInviteState getCallInviteState(){var state=super.getCallInviteState();setCallInviteUsedState();return state;}};db().add(r);listener.onMessageReceived("CA_TRANSITION",message);check(emitter().events.size()==1,"one snapshot event");check(emitter().scopes.get(0).equals(CommonConstants.ScopeCallInvite),"consistent invite scope");check(emitter().events.get(0).get(Constants.JS_EVENT_KEY_CALL_INFO)==null,"no call serialization");check(emitter().events.get(0).get(CommonConstants.CallInviteEventKeyCallSid).equals("CA_TRANSITION"),"consistent invite SID");});\n  test("concurrent removal cannot replace call identity",()->{try{var a=addCall("CA_A");var b=addCall("CA_B");var indexed=new java.util.concurrent.CountDownLatch(1);var removed=new java.util.concurrent.CountDownLatch(1);var list=new Vector<CallRecordDatabase.CallRecord>(){@Override public int indexOf(Object o){int i=super.indexOf(o);if(Thread.currentThread().getName().equals("message-reader")){indexed.countDown();try{removed.await(250,java.util.concurrent.TimeUnit.MILLISECONDS);}catch(InterruptedException e){throw new RuntimeException(e);}}return i;}};list.add(a);list.add(b);var field=CallRecordDatabase.class.getDeclaredField("callRecordList");field.setAccessible(true);field.set(db(),list);var errors=new java.util.concurrent.atomic.AtomicReference<Throwable>();var reader=new Thread(()->{try{listener.onMessageReceived("CA_A",message);}catch(Throwable e){errors.set(e);}},"message-reader");var remover=new Thread(()->{try{check(indexed.await(2,java.util.concurrent.TimeUnit.SECONDS),"reader indexed A");db().remove(a);}catch(Throwable e){errors.set(e);}finally{removed.countDown();}},"record-remover");reader.start();remover.start();reader.join(3000);remover.join(3000);check(!reader.isAlive()&&!remover.isAlive(),"threads completed");check(errors.get()==null,"no callback error: "+errors.get());check(emitter().events.size()==1,"one event");var info=(WritableMap)emitter().events.get(0).get(Constants.JS_EVENT_KEY_CALL_INFO);check(info.get("sid").equals("CA_A"),"A never becomes B");check(db().get(new CallRecordDatabase.CallRecord("CA_B"))==b,"B remains registered");}catch(Exception e){throw new RuntimeException(e);}});\n  test("sent and failure events retain original delivery",()->{listener.onMessageSent("CA_GONE","VE_SENT");listener.onMessageFailure("CA_GONE","VE_FAILED",new VoiceException());check(emitter().events.size()==2,"terminal events preserved");check(emitter().scopes.stream().allMatch(x->x.equals(CommonConstants.ScopeCallMessage)),"message route");check(emitter().events.get(0).get(CommonConstants.VoiceEventType).equals(CommonConstants.CallEventMessageSent),"sent type preserved");check(emitter().events.get(0).get(CommonConstants.VoiceEventSid).equals("VE_SENT"),"sent event SID preserved");check(emitter().events.get(1).get(CommonConstants.VoiceEventType).equals(CommonConstants.CallEventMessageFailure),"failure type preserved");check(emitter().events.get(1).get(CommonConstants.VoiceEventSid).equals("VE_FAILED"),"failed event SID preserved");check(emitter().events.get(1).get(CommonConstants.VoiceErrorKeyError)!=null,"failure error field preserved");});\n  System.out.println("RESULT "+passed+" passed, "+failed+" failed");if(failed>0)System.exit(1);\n }\n}',
  'com/twiliovoicereactnative/VoiceApplicationProxy.java':
    'package com.twiliovoicereactnative; class VoiceApplicationProxy { static CallRecordDatabase db=new CallRecordDatabase(); static JSEventEmitter emitter=new JSEventEmitter(); static CallRecordDatabase getCallRecordDatabase(){return db;} static JSEventEmitter getJSEventEmitter(){return emitter;} static void reset(){db=new CallRecordDatabase();emitter=new JSEventEmitter();} }',
  'com/twilio/voice/IceOptions.java':
    'package com.twilio.voice; public class IceOptions {}',
  'com/twilio/voice/Call.java':
    'package com.twilio.voice; public class Call { private final String sid; public Call(String s){sid=s;} public String getSid(){return sid;} public interface CallMessageListener { void onMessageFailure(String c,String v,VoiceException e); void onMessageSent(String c,String v); void onMessageReceived(String c,CallMessage m); } }',
  'com/twilio/voice/CancelledCallInvite.java':
    'package com.twilio.voice; public class CancelledCallInvite { public String getCallSid(){return "CA_CANCELLED";} }',
  'com/twilio/voice/CallInvite.java':
    'package com.twilio.voice; public class CallInvite { private final String sid; public CallInvite(String s){sid=s;} public String getCallSid(){return sid;} public java.util.Map<String,String> getCustomParameters(){return new java.util.HashMap<>();} }',
  'com/twilio/voice/CallMessage.java':
    'package com.twilio.voice; public class CallMessage {}',
  'com/twilio/voice/CallException.java':
    'package com.twilio.voice; public class CallException extends Exception {}',
  'com/twilio/voice/VoiceException.java':
    'package com.twilio.voice; public class VoiceException extends Exception {}',
  'com/facebook/react/bridge/WritableMap.java':
    'package com.facebook.react.bridge; public class WritableMap extends java.util.LinkedHashMap<String,Object> {}',
  'com/facebook/react/bridge/Arguments.java':
    'package com.facebook.react.bridge; public class Arguments {}',
  'android/util/Pair.java':
    'package android.util; public class Pair<F,S> { public final F first; public final S second; public Pair(F a,S b){first=a;second=b;} }',
  'androidx/annotation/Nullable.java':
    'package androidx.annotation; import java.lang.annotation.*; @Target({ElementType.TYPE_USE,ElementType.PARAMETER,ElementType.FIELD,ElementType.METHOD}) public @interface Nullable {}',
  'androidx/annotation/NonNull.java':
    'package androidx.annotation; import java.lang.annotation.*; @Target({ElementType.TYPE_USE,ElementType.PARAMETER,ElementType.FIELD,ElementType.METHOD}) public @interface NonNull {}',
};
const cases = [
  'valid outgoing message preserves call identity',
  'unknown SID does not crash or emit',
  'late message after actual record removal preserves other call',
  'null SID does not crash',
  'empty SID does not crash',
  'active invite retains invite route without native Call',
  'accepted invite before native Call population does not crash',
  'record without UUID does not reach asserting serializer',
  'invite transition uses one routing snapshot',
  'concurrent removal cannot replace call identity',
  'sent and failure events retain original delivery',
];

before(() => {
  mkdirSync(classes, { recursive: true });
  const files = [];
  for (const [relative, content] of Object.entries(fixtures)) {
    const path = join(source, relative);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    files.push(path);
  }
  for (const filename of [
    'CallMessageListenerProxy.java',
    'CallRecordDatabase.java',
  ]) {
    const path = join(source, 'com/twiliovoicereactnative', filename);
    copyFileSync(
      join(repo, 'android/src/main/java/com/twiliovoicereactnative', filename),
      path
    );
    files.push(path);
  }
  const result = spawnSync(binary('javac'), ['-d', classes, ...files], {
    encoding: 'utf8',
    timeout: 30000,
  });
  assert.equal(
    result.status,
    0,
    `JDK compilation failed: ${result.error?.message ?? ''}\n${
      result.stdout ?? ''
    }\n${result.stderr ?? ''}`
  );
});
after(() => rmSync(temporary, { recursive: true, force: true }));

for (const name of cases) {
  test(name, () => {
    const result = spawnSync(
      binary('java'),
      [
        '-cp',
        classes,
        'com.twiliovoicereactnative.CallMessageRegression',
        name,
      ],
      { encoding: 'utf8', timeout: 15000 }
    );
    assert.equal(
      result.status,
      0,
      `${result.error?.message ?? ''}\n${result.stdout ?? ''}\n${
        result.stderr ?? ''
      }`
    );
    assert.match(result.stdout, /RESULT 1 passed, 0 failed/);
  });
}
