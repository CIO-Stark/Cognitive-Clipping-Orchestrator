# Clipping Orchestrator

## About

> It is the main Cognitive Clipping Application BackEnd. Consists in APIs that retrieves the main information needed for the solution graphics and user interation.

## About APIs for IBM Connections (works only when ran from internal IBM Network)
 
> __Secure Gateway__ setup
In order to retrieve IBM Connections information from within IBM Internal (Blue) Network, this solution makes use of the __Secure Gateway Bluemix Service__.

1. Create the Service and add a new Gateway (the token is a good choice but it is not mandatory)
2. You must have a client that has access to the gateway endpoint and also to the premices data in order to expose your information via Bluemix Secure Gateway. There is a Client as a Service Solution but here we will consider the local Client.
3. Download and install the local client. For MAC, install and run: sudo ./secgw.command
4. It will ask for the __Gateway id__. Get it from the Service Web Interface
5. Client will connect to the Gateway and you should see this connection, as a new Connected Client within
6. Now, in your client, add a connection/route to a service you want to expose. For instance I will expose a local application running into http://localhost:6023/path:
run: acl allow localhost:6023/path
7. execute command: S   and see if it was created fine
8. In your Service Web Page, create a destination, adding the same localhost, port 6023 and, in this case, http
9. Save your destination and open the configuration. You should see the final endpoint. Something like: __Cloud Host : Port__
cap-sg-prd-4.integration.ibmcloud.com:xxxx
10. Done! Just execute this final endpoint (with the path) and while your local client is running and connected, you should receive the internal data from the external url!