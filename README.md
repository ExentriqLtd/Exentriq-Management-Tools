# EXENTRIQ-MANAGEMENT-TOOLS

## Notifications app

### Stage

Use the ```settings-staging.json``` for run meteor

Remplace ```sessionToken``` for your sessionToken

```debugUsername```: is optional (only for debug)

Local:

```
http://localhost:3000/notifications/?sessionToken=1454865801761741&channelUrl=http://stage.exentriq.com&debugUsername=demo
```

Remote:

```
http://37.187.137.140:5007/notifications/?sessionToken=1454865801761741&channelUrl=http://stage.exentriq.com&debugUsername=demo
```

### Production

Use the ```settings.json``` for run meteor

Remplace ```sessionToken``` for your sessionToken

Local:

```
http://localhost:3000/notifications/?sessionToken=1454865801761741&channelUrl=http://www.exentriq.com
```

Remote:

```
http://149.202.77.27:5007/notifications/?sessionToken=1454865801761741&channelUrl=http://www.exentriq.com
```
