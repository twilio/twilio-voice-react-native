# Known Issues

## Call Message API

- On iOS, when sending a CallMessage with a payload that exceeds the maximum payload size, neither the `OutgoingCallMessage#sent` or `OutgoingCallMessage#failure` will fire.
