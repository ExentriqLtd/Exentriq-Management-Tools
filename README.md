# EXENTRIQ-MANAGEMENT-TOOLS

## Notifications app

### Stage

Use the ```settings-staging.json``` for run meteor

Remplace ```sessionToken``` for your sessionToken

```channelUrl```: is optional (only for debug)

```debugUsername```: is optional (only for debug)

Local:

```
http://localhost:3000/notifications/?sessionToken=1459875834346698&channelUrl=http://stage.exentriq.com&debugUsername=demo
```

Remote:

```
http://37.187.137.140:5007/notifications/?sessionToken=1459875834346698&channelUrl=http://stage.exentriq.com&debugUsername=demo
```

### Production

Use the ```settings.json``` for run meteor

Remplace ```sessionToken``` for your sessionToken

Local:

```
http://localhost:3000/notifications/?sessionToken=1459875834346698
```

Remote:

```
http://149.202.77.27:5007/notifications/?sessionToken=1459875834346698
```

### Cordova Dev

#### Stage

Use the ```settings-staging.json``` for run meteor

For simulate cordova in the browser, set ```simulateCordova``` to ```true``` in the ```settings-staging.json```

Browser (simulateCordova):

```
http://localhost:3000
```

iOS (Simulator):

```
meteor run ios --settings settings-staging.json --port 3000
```

iOS Device:

```
meteor run ios-device --settings settings-staging.json --port 3000
```

Android (Simulator):

```
meteor run android --settings settings-staging.json --port 3000
```

Android Device:

```
meteor run android-device --settings settings-staging.json --port 3000
```

#### Production

Use the ```settings.json``` for run meteor

For simulate cordova in the browser, set ```simulateCordova``` to ```true``` in the ```settings.json```

Browser (simulateCordova):

```
http://localhost:3000
```

iOS (Simulator):

```
meteor run ios --settings settings.json --port 3000
```

iOS Device:

```
meteor run ios-device --settings settings.json --port 3000
```

Android (Simulator):

```
meteor run android --settings settings.json --port 3000
```

Android Device:

```
meteor run android-device --settings settings.json --port 3000
```

### Cordova Building

#### Stage

iOS:
```
bash build-ios-staging.sh
```

#### Production

iOS:
```
bash build-ios.sh
```
