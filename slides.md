---
type: slide
slideOptions:
  transition: slide
  theme: solarized
  
---

AWS Serverless mit CDK
--

Max Tharr


---

1. Introduction
2. Was meint Serverless?
3. AWS Serverless Services
4. Cloud Development Kit (CDK)
5. Setup for this workshop
6. Contribute your own Lambdas!

---

# Serverless

A: Die Infrastruktur, die für eine Anwendung benötigt wird, wird vollständig vom Cloud-Anbieter verwaltet.

B: Wenn es nichts kostet wenn deine Software nicht genutzt wird, dann ist es Serverless

Note:
Der Begriff wird überall verwendet, aber was ist damit eigentlich gemeint?


---

# AWS Serverless Services*

*Eine Auswahl

----

## Lambda 

- Serverless Computing Service
- AWS stellt eine Umgebung und ein SDK bereit, so dass man 'nur' Code schreiben muss
> Schnell und billig bei wenigen Aufrufen, aber teuer, wenn man seinen Gesamtworkload darüber laufen lassen will

----

## SQS (Simple Queue Service)

- Asynchroner messaging service
- Gut zum decouplen von workloads
- Gut integriert in andere AWS services

----

## Api Gateway

- API Endpunkt
- Rest API oder generische HTTP(S) API
- Kümmert sich um SSL und validieren von Requests, leitet an andere Services weiter

----

## DynamoDB

- "NoSQL" Datenbank (Nicht wie MongoDB)
- Ein Key-Value-Store, der auch mit sehr vielen Einträgen sehr schnelle Antworten liefert
- Prinzip: Filtern ist schneller als ein Join

----

## Cloud Watch

Logs und Metriken

----

## X-Ray

Tracing, integriert in CloudWatch

---

# CDK 
## Cloud Development Kit

----

- Infrastructure-as-Code Ansatz von AWS
- Basiert auf CloudFormation
- Modulares Erstellen von Stacks in für Entwickler vertrauten Programmiersprachen
- Funktioniert u.a. mit Python, TypeScript, Java, C#

----

- Infrastructure-as-Code Ansatz von AWS
- Basiert auf CloudFormation
- Modulares Erstellen von Stacks in für Entwickler vertrauten Programmiersprachen
- Funktioniert u.a. mit Python, TypeScript, Java
- **Funktioniert richtig gut nur mit TypeScript**

----

Beispiel:
```
api = aws_apigateway.RestApi(
            self,
            "telephone-game-api",
            rest_api_name="Telephone game",
            description="This api handles strings like the children game telephone",
            deploy_options=aws_apigateway.StageOptions(tracing_enabled=True),
        )
```

---

# Workshop

- Ich habe einen CDK Stack vorbereitet, der das Kinderspiel "Stille Post" mit Hilfe von Lambdas nachspielt.
- Jedes Lambda bekommt einen String als Input, soll ihn transformieren und dann an eine SQS Queue weitergeben. Dabei wird die ursprüngliche Nachricht immer weiter verfälscht, so wie bei Stille Post


----

## Wie geht das konkret?

----

Ich habe zwei Beispiele im Ordner `workers` angelegt. Einmal **JavaScript**, einmal **Python**
 

#### Was ihr tun müsst:
Das Projekt auf github forken, den Ordner `py-example` oder `js-example` kopieren, dabei muss euer neuer Ordnername auch den prefix `py-` oder `js-` behalten, damit mein CDK-Code erkennt, welche Runtime benutzt wird. 

Danach im Code die Lambda nach euren Wünschen verändern


