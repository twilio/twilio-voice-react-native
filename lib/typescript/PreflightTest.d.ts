/**
 * Copyright © 2025 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */
import { EventEmitter } from 'eventemitter3';
import type { Call } from './Call';
import { Constants } from './constants';
import { TwilioError } from './error';
import type { AudioCodec } from './type/AudioCodec';
import type { IceServer, IceTransportPolicy } from './type/Ice';
export interface PreflightTest {
    /**
     * ------------
     * Emit Typings
     * ------------
     */
    /** @internal */
    emit(connectedEvent: PreflightTest.Event.Connected): boolean;
    /** @internal */
    emit(completedEvent: PreflightTest.Event.Completed, report: PreflightTest.Report): boolean;
    /** @internal */
    emit(failedEvent: PreflightTest.Event.Failed, error: TwilioError): boolean;
    /** @internal */
    emit(sampleEvent: PreflightTest.Event.Sample, sample: PreflightTest.RTCSample): boolean;
    /** @internal */
    emit(qualityWarningEvent: PreflightTest.Event.QualityWarning, currentWarnings: Call.QualityWarning[], previousWarnings: Call.QualityWarning[]): boolean;
    /**
     * ----------------
     * Listener Typings
     * ----------------
     */
    /**
     * Connected event. Raised when the PreflightTest has successfully connected.
     *
     * @example
     * ```typescript
     * preflightTest.addListener(PreflightTest.Event.Connected, () => {
     *   // preflightTest has been connected
     * });
     * ```
     *
     * @param connectedEvent - The raised event string.
     * @param listener - A listener function that will be invoked when the event
     * is raised.
     * @returns - The PreflightTest object.
     */
    addListener(connectedEvent: PreflightTest.Event.Connected, listener: PreflightTest.Listener.Connected): this;
    /** {@inheritDoc (PreflightTest:interface).(addListener:1)} */
    on(connectedEvent: PreflightTest.Event.Connected, listener: PreflightTest.Listener.Connected): this;
    /**
     * Completed event. Raised when the PreflightTest has successfully completed.
     *
     * @example
     * ```typescript
     * preflightTest.addListener(PreflightTest.Event.Completed, (report: PreflightTest.Report) => {
     *   // preflightTest has been completed
     *   // consider using the report and adjusting your UI to show any potential issues
     * });
     * ```
     *
     * @param completedEvent - The raised event string.
     * @param listener - A listener function that will be invoked when the event
     * is raised.
     * @returns - The PreflightTest object.
     */
    addListener(completedEvent: PreflightTest.Event.Completed, listener: PreflightTest.Listener.Completed): this;
    /** {@inheritDoc (PreflightTest:interface).(addListener:2)} */
    on(completedEvent: PreflightTest.Event.Completed, listener: PreflightTest.Listener.Completed): this;
    /**
     * Failed event. Raised when the PreflightTest was unable to be performed.
     *
     * @example
     * ```typescript
     * preflightTest.addListener(PreflightTest.Event.Failed, (error: TwilioError) => {
     *   // preflightTest has failed
     *   // consider adjusting your UI to show the error
     * });
     * ```
     *
     * @param failedEvent - The raised event string.
     * @param listener - A listener function that will be invoked when the event
     * is raised.
     * @returns - The PreflightTest object.
     */
    addListener(failedEvent: PreflightTest.Event.Failed, listener: PreflightTest.Listener.Failed): this;
    /** {@inheritDoc (PreflightTest:interface).(addListener:3)} */
    on(failedEvent: PreflightTest.Event.Failed, listener: PreflightTest.Listener.Failed): this;
    /**
     * Sample event. Raised when the PreflightTest has generated a stats sample
     * during the test.
     *
     * @example
     * ```typescript
     * preflightTest.addListener(PreflightTest.Event.Sample, (sample: PreflightTest.Sample) => {
     *   // preflightTest has generated a sample
     *   // consider updating your UI with information from the sample
     * });
     * ```
     *
     * @param sampleEvent - The raised event string.
     * @param listener - A listener function that will be invoked when the event
     * is raised.
     * @returns - The PreflightTest object.
     */
    addListener(sampleEvent: PreflightTest.Event.Sample, listener: PreflightTest.Listener.Sample): this;
    /** {@inheritDoc (PreflightTest:interface).(addListener:4)} */
    on(sampleEvent: PreflightTest.Event.Sample, listener: PreflightTest.Listener.Sample): this;
    /**
     * QualityWarning event. Raised when the PreflightTest has encountered a
     * QualityWarning during a test.
     *
     * @example
     * ```typescript
     * preflightTest.addListener(
     *   PreflightTest.Event.QualityWarning,
     *   (currentWarnings: Call.QualityWarning[], previousWarnings: Call.QualityWarning[]) => {
     *     // preflightTest has generated or cleared a quality warning
     *     // consider updating your UI with information about the warning
     *   },
     * );
     * ```
     *
     * @param qualityWarningEvent - The raised event string.
     * @param listener - A listener function that will be invoked when the event
     * is raised.
     * @returns - The PreflightTest object.
     */
    addListener(warningEvent: PreflightTest.Event.QualityWarning, listener: PreflightTest.Listener.QualityWarning): this;
    /** {@inheritDoc (PreflightTest:interface).(addListener:5)} */
    on(warningEvent: PreflightTest.Event.QualityWarning, listener: PreflightTest.Listener.QualityWarning): this;
    /**
     * Generic event listener typings.
     * @param preflightTestEvent - The raised event string.
     * @param listener - A listener function that will be invoked when the event
     * is raised.
     * @returns - The PreflightTest object.
     */
    addListener(event: PreflightTest.Event, listener: PreflightTest.Listener.Generic): this;
    /** {@inheritDoc (PreflightTest:interface).(addListener:6)} */
    on(event: PreflightTest.Event, listener: PreflightTest.Listener.Generic): this;
}
/**
 * The PreflightTest for Voice React Native SDK allows you to anticipate and
 * troubleshoot end users' connectivity and bandwidth issues before or during
 * Twilio Voice calls.
 *
 * You can run a PreflightTest before a Twilio Voice call. The PreflightTest
 * performs a test call to Twilio and provides a
 * {@link (PreflightTest:namespace).Report} object at the end. The report
 * includes information about the end user's network connection (including
 * jitter, packet loss, and round trip time) and connection settings.
 *
 * @example
 * ```typescript
 * const accessToken = ...;
 * const preflightTest = voice.runPreflightTest(accessToken);
 *
 * preflightTest.on(PreflightTest.Event.Connected, () => {
 *   // handle when preflightTest connects
 * });
 *
 * preflightTest.on(PreflightTest.Event.Completed, (report: PreflightTest.Report) => {
 *   // handle when preflightTest is complete
 * });
 *
 * preflightTest.on(PreflightTest.Event.Failed, (error: TwilioError) => {
 *   // handle preflightTest errors
 * });
 *
 * preflightTest.on(
 *   PreflightTest.Event.QualityWarning,
 *   (currentWarnings: Call.QualityWarning[], previousWarnings: Call.QualityWarning[]) => {
 *     // handle preflightTest quality warnings
 *   },
 * );
 *
 * preflightTest.on(PreflightTest.Event.Sample, (sample: PreflightTest.Sample) => {
 *   // handle preflightTest sample
 * });
 * ```
 */
export declare class PreflightTest extends EventEmitter {
    /**
     * UUID of the PreflightTest. This is generated by the native layer and used
     * to link events emitted by the native layer to the respective JS object.
     */
    private _uuid;
    /**
     * PreflightTest constructor.
     *
     * @internal
     */
    constructor(uuid: string);
    /**
     * Handle all PreflightTest native events.
     */
    private _handleNativeEvent;
    /**
     * Handle completed event.
     */
    private _handleCompletedEvent;
    /**
     * Handle connected event.
     */
    private _handleConnectedEvent;
    /**
     * Handle failed event.
     */
    private _handleFailedEvent;
    /**
     * Handle quality warning event.
     */
    private _handleQualityWarningEvent;
    /**
     * Handle sample event.
     */
    private _handleSampleEvent;
    /**
     * Internal helper method to invoke a native method and handle the returned
     * promise from the native method.
     */
    private _invokeAndCatchNativeMethod;
    /**
     * Get the CallSid of the underlying Call in the PreflightTest.
     *
     * @returns
     * Promise that
     * - Resolves with a string representing the CallSid.
     * - Rejects if the native layer could not find the CallSid for this
     *   PreflightTest object.
     */
    getCallSid(): Promise<string>;
    /**
     * Get the end time of the PreflightTest.
     *
     * @returns
     * A Promise that
     * - Resolves with `number` if the PreflightTest has ended.
     * - Resolves with `undefined` if PreflightTest has not ended.
     * - Rejects if the native layer encountered an error.
     */
    getEndTime(): Promise<number>;
    /**
     * Get the latest stats sample generated by the PreflightTest.
     *
     * @returns
     * A Promise that
     * - Resolves with the last {@link (PreflightTest:namespace).RTCSample}
     *   generated by the PreflightTest.
     * - Resolves with `undefined` if there is no previously generated sample.
     * - Rejects if the native layer encountered an error.
     */
    getLatestSample(): Promise<PreflightTest.RTCSample>;
    /**
     * Get the final report generated by the PreflightTest.
     *
     * @returns
     * A Promise that
     * - Resolves with the final {@link (PreflightTest:namespace).Report}.
     * - Resolves with `undefined` if the report is unavailable.
     * - Rejects if the native layer encountered an error.
     */
    getReport(): Promise<PreflightTest.Report>;
    /**
     * Get the start time of the PreflightTest.
     *
     * @returns
     * A Promise that
     * - Resolves with a `number` representing the start time of the
     *   PreflightTest.
     * - Rejects if the native layer encountered an error.
     */
    getStartTime(): Promise<number>;
    /**
     * Get the state of the PreflightTest.
     *
     * @returns
     * A Promise that
     * - Resolves with the current state of the PreflightTest.
     * - Rejects if the native layer encountered an error.
     */
    getState(): Promise<PreflightTest.State>;
    /**
     * Stop the ongoing PreflightTest.
     *
     * @returns
     * A Promise that
     * - Resolves if the PreflightTest was successfully stopped.
     * - Rejects if the native layer encountered an error.
     */
    stop(): Promise<void>;
}
/**
 * Helper types for the PrefligthTest class.
 */
export declare namespace PreflightTest {
    /**
     * Options to run a PreflightTest.
     */
    interface Options {
        /**
         * Array of ICE servers to use for the PreflightTest.
         */
        [Constants.CallOptionsKeyIceServers]?: IceServer[];
        /**
         * The ICE transport policy to use for the PreflightTest.
         */
        [Constants.CallOptionsKeyIceTransportPolicy]?: IceTransportPolicy;
        /**
         * The preferred audio codec to use for the PreflightTest.
         */
        [Constants.CallOptionsKeyPreferredAudioCodecs]?: AudioCodec[];
    }
    /**
     * Events raised by the PreflightTest.
     */
    enum Event {
        /** {@inheritdoc (PreflightTest:interface).(addListener:1)} */
        Connected = "connected",
        /** {@inheritdoc (PreflightTest:interface).(addListener:2)} */
        Completed = "completed",
        /** {@inheritdoc (PreflightTest:interface).(addListener:3)} */
        Failed = "failed",
        /** {@inheritdoc (PreflightTest:interface).(addListener:4)} */
        Sample = "sample",
        /** {@inheritdoc (PreflightTest:interface).(addListener:5)} */
        QualityWarning = "qualityWarning"
    }
    /**
     * Types of the listener methods that are bound to the PreflightTest events.
     */
    namespace Listener {
        /** {@inheritdoc (PreflightTest:interface).(addListener:1)} */
        type Connected = () => void;
        /** {@inheritdoc (PreflightTest:interface).(addListener:2)} */
        type Completed = (report: Report) => void;
        /** {@inheritdoc (PreflightTest:interface).(addListener:3)} */
        type Failed = (error: TwilioError) => void;
        /** {@inheritdoc (PreflightTest:interface).(addListener:4)} */
        type Sample = (sample: RTCSample) => void;
        /** {@inheritdoc (PreflightTest:interface).(addListener:5)} */
        type QualityWarning = (currentWarnings: Call.QualityWarning[], previousWarnings: Call.QualityWarning[]) => void;
        /** {@inheritdoc (PreflightTest:interface).(addListener:6)} */
        type Generic = (...args: any[]) => void;
    }
    /**
     * States of the PreflightTest object.
     */
    enum State {
        /**
         * The state of the PreflightTest after the connected event has been raised.
         *
         * See {@link (PreflightTest:interface).(addListener:1)}.
         */
        Connected = "connected",
        /**
         * The state of the PreflightTest after the completed event has been raised.
         *
         * See {@link (PreflightTest:interface).(addListener:2)}.
         */
        Completed = "completed",
        /**
         * The state of the PreflightTest after the PreflightTest has been started
         * but not yet connected.
         */
        Connecting = "connecting",
        /**
         * The state of the PreflightTest after the failed event has been raised.
         *
         * See {@link (PreflightTest:interface).(addListener:3)}.
         */
        Failed = "failed"
    }
    /**
     * Represents general stats for a specific metric.
     */
    interface Stats {
        /**
         * The average value for this metric.
         */
        [Constants.PreflightStatsAverage]: number;
        /**
         * The maximum value for this metric.
         */
        [Constants.PreflightStatsMax]: number;
        /**
         * The minimum value for this metric.
         */
        [Constants.PreflightStatsMin]: number;
    }
    /**
     * Represents RTC related stats that are extracted from RTC samples.
     */
    interface RTCStats {
        /**
         * Packets delay variation.
         */
        [Constants.PreflightRTCStatsJitter]: Stats;
        /**
         * Mean opinion score, 1.0 through roughly 4.5.
         */
        [Constants.PreflightRTCStatsMos]: Stats;
        /**
         * Round trip time, to the server back to the client.
         */
        [Constants.PreflightRTCStatsRtt]: Stats;
    }
    /**
     * Timing measurements that provide operational milestones.
     */
    interface TimeMeasurement {
        /**
         * Number of milliseconds elapsed for this measurements.
         */
        [Constants.PreflightTimeMeasurementDuration]: number;
        /**
         * A millisecond timestamp that represents the end of a PreflightTest.
         */
        [Constants.PreflightTimeMeasurementEnd]: number;
        /**
         * A millisecond timestamp that represents the start of a PreflightTest.
         */
        [Constants.PreflightTimeMeasurementStart]: number;
    }
    /**
     * Represents network related time measurements.
     */
    interface NetworkTiming {
        /**
         * Measurements for establishing ICE connection.
         */
        [Constants.PreflightNetworkTimingIce]: TimeMeasurement;
        /**
         * Measurements for establishing a PeerConnection.
         */
        [Constants.PreflightNetworkTimingPeerConnection]: TimeMeasurement;
        /**
         * Measurements for establishing a signaling connection.
         */
        [Constants.PreflightNetworkTimingSignaling]: TimeMeasurement;
    }
    /**
     * A warning that can be raised by the `PreflightTest` and returned in the
     * `PreflightTest.Report.warnings` field.
     */
    interface Warning {
        /**
         * Name of the warning.
         */
        [Constants.PreflightWarningName]: string;
        /**
         * Threshold value that, when exceeded, will trigger this warning.
         */
        [Constants.PreflightWarningThreshold]: string;
        /**
         * Detected values that exceeded the threshold value and triggered this
         * warning.
         */
        [Constants.PreflightWarningValues]: string;
        /**
         * Timestamp of the warning.
         */
        [Constants.PreflightWarningTimestamp]: number;
    }
    /**
     * Signifies when a `PreflightTest.Warning` has been cleared. Emitted by the
     * `PreflightTest` when the warning was cleared and also included in the
     * `PreflightTest.Report.warningsCleared` field.
     */
    interface WarningCleared {
        /**
         * The name of the cleared warning.
         */
        [Constants.PreflightWarningClearedName]: string;
        /**
         * The timestamp when the warning was cleared.
         */
        [Constants.PreflightWarningClearedTimestamp]: number;
    }
    /**
     * Provides information related to the ICE candidate.
     */
    interface RTCIceCandidateStats {
        /**
         * The type of the ICE candidate.
         */
        [Constants.PreflightRTCIceCandidateStatsCandidateType]: string;
        /**
         * Whether or not the candidate was deleted.
         */
        [Constants.PreflightRTCIceCandidateStatsDeleted]: boolean;
        /**
         * The IP address of the ICE candidate.
         */
        [Constants.PreflightRTCIceCandidateStatsIp]: string;
        /**
         * Whether or not the ICE candidate is remote. True if remote, false if
         * local.
         */
        [Constants.PreflightRTCIceCandidateStatsIsRemote]: boolean;
        /**
         * Represents the network cost of the ICE candidate.
         */
        [Constants.PreflightRTCIceCandidateStatsNetworkCost]: number;
        /**
         * The network ID of the ICE candidate.
         */
        [Constants.PreflightRTCIceCandidateStatsNetworkId]: number;
        /**
         * The network type of the ICE candidate.
         */
        [Constants.PreflightRTCIceCandidateStatsNetworkType]: string;
        /**
         * The port of the ICE candidate.
         */
        [Constants.PreflightRTCIceCandidateStatsPort]: number;
        /**
         * The priority of the ICE candidate.
         */
        [Constants.PreflightRTCIceCandidateStatsPriority]: number;
        /**
         * The protocol that the ICE candidate is using to communicate.
         */
        [Constants.PreflightRTCIceCandidateStatsProtocol]: string;
        /**
         * The related address of the ICE candidate.
         */
        [Constants.PreflightRTCIceCandidateStatsRelatedAddress]: string;
        /**
         * The related port of the ICE candidate.
         */
        [Constants.PreflightRTCIceCandidateStatsRelatedPort]: number;
        /**
         * The TCP type of the ICE candidate.
         */
        [Constants.PreflightRTCIceCandidateStatsTcpType]: string;
        /**
         * The transport ID of the ICE candidate.
         */
        [Constants.PreflightRTCIceCandidateStatsTransportId]: string;
        /**
         * The URL of the ICE candidate.
         */
        [Constants.PreflightRTCIceCandidateStatsUrl]: string;
    }
    /**
     * The `PreflightTest.RTCIceCandidateStats` of the selected remote and local
     * ICE candidates.
     */
    interface RTCSelectedIceCandidatePairStats {
        /**
         * The stats of the local candidate.
         */
        [Constants.PreflightRTCSelectedIceCandidatePairStatsLocalCandidate]: RTCIceCandidateStats;
        /**
         * The stats of the remote candidate.
         */
        [Constants.PreflightRTCSelectedIceCandidatePairStatsRemoteCandidate]: RTCIceCandidateStats;
    }
    /**
     * A sample generated during the progress of a `PreflightTest`.
     */
    interface RTCSample {
        /**
         * The audio input level at the time when the sample was taken.
         */
        [Constants.PreflightRTCSampleAudioInputLevel]: number;
        /**
         * The audio output level at the time when the sample was taken.
         */
        [Constants.PreflightRTCSampleAudioOutputLevel]: number;
        /**
         * The bytes sent at the time when the sample was taken.
         */
        [Constants.PreflightRTCSampleBytesReceived]: number;
        /**
         * The bytes received at the time when the sample was taken.
         */
        [Constants.PreflightRTCSampleBytesSent]: number;
        /**
         * The codec used by the underlying media connection.
         */
        [Constants.PreflightRTCSampleCodec]: string;
        /**
         * The jitter present in the underlying media connection at the time when
         * the sample was taken.
         */
        [Constants.PreflightRTCSampleJitter]: number;
        /**
         * The evaluated MOS score of the underlying media connection at the time
         * when the sample was taken.
         */
        [Constants.PreflightRTCSampleMos]: number;
        /**
         * The number of packets lost during the `PreflightTest`.
         */
        [Constants.PreflightRTCSamplePacketsLost]: number;
        /**
         * The fraction of total packets lost during the `PreflightTest`.
         */
        [Constants.PreflightRTCSamplePacketsLostFraction]: number;
        /**
         * The number of packets received during the `PreflightTest`.
         */
        [Constants.PreflightRTCSamplePacketsReceived]: number;
        /**
         * The number of packets sent during the `PreflightTest`.
         */
        [Constants.PreflightRTCSamplePacketsSent]: number;
        /**
         * The round-trip time of a network packet at the time when the sample was
         * taken.
         */
        [Constants.PreflightRTCSampleRtt]: number;
        /**
         * The timestamp of when the RTC sample was taken during the
         * `PreflightTest`.
         */
        [Constants.PreflightRTCSampleTimestamp]: number;
    }
    /**
     * The call quality.
     */
    enum CallQuality {
        /**
         * Indicates `4.2 < average MOS`.
         */
        Excellent = "excellent",
        /**
         * Indicates `4.1 <= average MOS <= 4.2`.
         */
        Great = "great",
        /**
         * Indicates `3.7 <= average MOS < 4.1`.
         */
        Good = "good",
        /**
         * Indicates `3.1 <= average MOS < 3.7`.
         */
        Fair = "fair",
        /**
         * Indicates `average MOS < 3.1`.
         */
        Degraded = "degraded"
    }
    /**
     * The final report generated by the `PreflightTest` upon completion. Contains
     * info related to the call quality and RTC statistics generated during the
     * `PreflightTest`.
     */
    interface Report {
        /**
         * The `CallSid` of the underlying Twilio call used by the `PreflightTest`.
         */
        [Constants.PreflightReportCallSid]: string;
        /**
         * The rated average MOS score of the `PreflightTest`. This value can help
         * indicate the expected quality of future calls.
         */
        [Constants.PreflightReportCallQuality]: CallQuality | null;
        /**
         * The Twilio Edge used by the `Call` in the `PreflightTest`.
         */
        [Constants.PreflightReportEdge]: string;
        /**
         * An array of ICE candidates gathered when connecting to media.
         */
        [Constants.PreflightReportIceCandidateStats]: RTCIceCandidateStats[];
        /**
         * Whether TURN is required to connect to media.
         *
         * This is dependent on the selected ICE candidates, and will be `true` if
         * either is of type "relay", `false` if both are of another type, or
         * `null` if there are no selected ICE candidates.
         *
         * See `PreflightTest.Options.iceServers` for more details.
         */
        [Constants.PreflightReportIsTurnRequired]: boolean | null;
        /**
         * The RTC related stats captured during the `PreflightTest`.
         */
        [Constants.PreflightReportStats]: RTCStats;
        /**
         * Network related time measurements.
         */
        [Constants.PreflightReportNetworkTiming]: NetworkTiming;
        /**
         * Time measurements of the `PreflightTest` in its entirety.
         */
        [Constants.PreflightReportTestTiming]: TimeMeasurement;
        /**
         * RTC samples collected during the `PreflightTest`.
         */
        [Constants.PreflightReportSamples]: RTCSample[];
        /**
         * The Twilio Edge value passed when constructing the `PreflightTest`.
         */
        [Constants.PreflightReportSelectedEdge]: string;
        /**
         * RTC stats for the ICE candidate pair used to connect to media, if ICE
         * candidates were selected.
         */
        [Constants.PreflightReportSelectedIceCandidatePairStats]: RTCSelectedIceCandidatePairStats;
        /**
         * Array of warnings detected during the `PreflightTest`.
         */
        [Constants.PreflightReportWarnings]: Warning[];
        /**
         * Array of warnings cleared during the `PreflightTest.`
         */
        [Constants.PreflightReportWarningsCleared]: WarningCleared[];
    }
}
