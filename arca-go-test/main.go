package main

import (
	"encoding/json"
	"fmt"
	"net"
	"regexp"
	"time"

	dbbus "github.com/m3co/arca-dbbus"
	jsonrpc "github.com/m3co/arca-jsonrpc"
)

// Request is what comes from the client
type Request struct {
	ID      string
	Method  string
	Context interface{}
}

// Handles incoming requests.
func handleRequest(conn net.Conn) {
	// Make a buffer to hold incoming data.

	buf := make([]byte, 1024)
	_, err := conn.Read(buf)
	if err != nil {
		fmt.Println("Error reading:", err.Error())
		return
	}

	r, _ := regexp.Compile("({.+})")
	msgFromClient := string(buf)
	msgToJSON := r.FindString(msgFromClient)

	request := &Request{}
	if err := json.Unmarshal([]byte(msgToJSON), request); err != nil {
		fmt.Printf("error %v with buff --%s--\n", err, msgToJSON)
		return
	}
	fmt.Println(request, "received from client")

	response := jsonrpc.Response{}
	response.ID = request.ID
	response.Method = "error-in-the-middle"
	response.Context = map[string]string{
		"Source": "test",
	}
	response.Result = map[string]string{
		"Message": "this is the message",
	}
	responseMsg, _ := json.Marshal(response)

	if request.Method == "msg-in-2-parts" {
		first := responseMsg[:100]
		last := responseMsg[100:]

		fmt.Println(string(first))
		conn.Write(first)

		fmt.Println("waiting...")
		time.Sleep(200 * time.Millisecond)

		fmt.Println(string(last))
		conn.Write(last)
	}

	if request.Method == "msg-in-3-parts" {
		first := responseMsg[:50]
		second := responseMsg[50:100]
		last := responseMsg[100:]

		fmt.Println(string(first))
		conn.Write(first)

		fmt.Println("waiting...")
		time.Sleep(200 * time.Millisecond)

		fmt.Println(string(second))
		conn.Write(second)

		fmt.Println("waiting...")
		time.Sleep(200 * time.Millisecond)

		fmt.Println(string(last))
		conn.Write(last)
	}

	if request.Method == "msg-in-4-parts" {
		first := responseMsg[:30]
		second := responseMsg[30:60]
		third := responseMsg[60:90]
		last := responseMsg[90:]

		fmt.Println(string(first))
		conn.Write(first)

		fmt.Println("waiting...")
		time.Sleep(200 * time.Millisecond)

		fmt.Println(string(second))
		conn.Write(second)

		fmt.Println("waiting...")
		time.Sleep(200 * time.Millisecond)

		fmt.Println(string(third))
		conn.Write(third)

		fmt.Println("waiting...")
		time.Sleep(200 * time.Millisecond)

		fmt.Println(string(last))
		conn.Write(last)
	}

	if request.Method == "2-msg-in-1-parts" {
		response.ID = ""
		responseMsg2, _ := json.Marshal(response)
		twoMessages := fmt.Sprintf("%s\n%s", string(responseMsg), string(responseMsg2))
		fmt.Println(twoMessages, "esto son dos mensajes a la vez")
		conn.Write([]byte(twoMessages))
	}

	if request.Method == "2-msg-in-2-parts-where-1-break-2-ok" {
		response.ID = ""
		responseMsg2, _ := json.Marshal(response)
		twoMessages := []byte(fmt.Sprintf("%s\n%s", string(responseMsg), string(responseMsg2)))

		first := twoMessages[:40]
		second := twoMessages[40:]

		fmt.Println(string(first))
		conn.Write(first)

		fmt.Println("waiting...")
		time.Sleep(200 * time.Millisecond)

		fmt.Println(string(second))
		conn.Write(second)
	}

	if request.Method == "2-msg-in-2-parts-where-1-ok-2-break" {
		response.ID = ""
		responseMsg2, _ := json.Marshal(response)
		twoMessages := []byte(fmt.Sprintf("%s\n%s", string(responseMsg), string(responseMsg2)))

		first := twoMessages[:160]
		second := twoMessages[160:]

		fmt.Println(string(first))
		conn.Write(first)

		fmt.Println("waiting...")
		time.Sleep(200 * time.Millisecond)

		fmt.Println(string(second))
		conn.Write(second)
	}

	if request.Method == "2-msg-in-2-parts-where-1-break-2-break" {
		response.ID = ""
		responseMsg2, _ := json.Marshal(response)
		twoMessages := []byte(fmt.Sprintf("%s\n%s", string(responseMsg), string(responseMsg2)))

		first := twoMessages[:100]
		second := twoMessages[100:200]
		third := twoMessages[200:]

		fmt.Println(string(first))
		conn.Write(first)

		fmt.Println("waiting...")
		time.Sleep(200 * time.Millisecond)

		fmt.Println(string(second))
		conn.Write(second)

		fmt.Println("waiting...")
		time.Sleep(200 * time.Millisecond)

		fmt.Println(string(third))
		conn.Write(third)
	}

	if request.Method == "2-msg-in-2-parts-where-1-ok-noEOL-2-break" {
		response.ID = ""
		responseMsg2, _ := json.Marshal(response)
		twoMessages := []byte(fmt.Sprintf("%s\n%s", string(responseMsg), string(responseMsg2)))

		first := twoMessages[:135]
		second := twoMessages[135:]

		fmt.Println(string(first))
		conn.Write(first)

		fmt.Println("waiting...")
		time.Sleep(200 * time.Millisecond)

		fmt.Println(string(second))
		conn.Write(second)
	}

	if request.Method == "1-request-1-response-1-notification" {
		response.ID = ""
		response.Result = map[string]string{
			"Message": "this is the message 1",
		}
		response.Method = "notification-sent"
		responseMsg2, _ := json.Marshal(response)
		twoMessages := []byte(fmt.Sprintf("%s\n%s\n", string(responseMsg2), string(responseMsg)))

		fmt.Println(string(twoMessages))
		conn.Write(twoMessages)
		handleRequest(conn)
	}

	if request.Method == "1-request-1-response-1-notification-target" {
		response.Result = map[string]string{
			"Message": "this is the message 1",
		}
		response.Context = map[string]string{
			"Target": "test",
		}
		response.Method = "notification-sent"
		responseMsg2, _ := json.Marshal(response)

		response.ID = ""
		response.Result = map[string]string{
			"Message": "this is the message 1",
		}
		response.Context = map[string]string{
			"Target": "test",
		}
		response.Method = "notification-sent"
		responseMsg3, _ := json.Marshal(response)
		twoMessages := []byte(fmt.Sprintf("%s\n%s\n", string(responseMsg3), string(responseMsg2)))

		fmt.Println(string(twoMessages))
		conn.Write(twoMessages)
		handleRequest(conn)
	}

	if request.Method == "Select" {
		response.Result = []string{}
		response.Method = request.Method
		responseMsg2, _ := json.Marshal(response)
		conn.Write(responseMsg2)
	}

	conn.Write(([]byte("\n")))
	// Close the connection when you're done with it.
	conn.Close()
}

func runserverApart() {
	const (
		connHost = ""
		connPort = "22346"
		connType = "tcp"
	)
	l, err := net.Listen(connType, connHost+":"+connPort)
	if err != nil {
		fmt.Println("Error listening:", err.Error())
		return
	}
	// Close the listener when the application closes.
	defer l.Close()
	fmt.Println("Listening on " + connHost + ":" + connPort)
	for {
		// Listen for an incoming connection.
		fmt.Println("listening............")
		conn, err := l.Accept()
		fmt.Println("............connected")
		if err != nil {
			fmt.Println("Error accepting: ", err.Error())
			return
		}
		// Handle connections in a new goroutine.
		go handleRequest(conn)
	}
}

// Handles incoming requests.
func handleRequest2(conn net.Conn) {
	// Make a buffer to hold incoming data.
	response := jsonrpc.Response{}
	response.ID = "id-request"
	response.Method = "error-in-the-middle"
	response.Context = map[string]string{
		"Source": "test",
	}
	response.Result = map[string]string{
		"Message": "this is the message",
	}

	time.Sleep(100 * time.Millisecond)
	func() {
		response.Method = "requested"
		responseMsg, _ := json.Marshal(response)
		conn.Write(responseMsg)
		conn.Write(([]byte("\n")))
	}()

	func() {
		response.ID = ""
		response.Method = "notification"
		responseMsg, _ := json.Marshal(response)
		conn.Write(responseMsg)
		conn.Write(([]byte("\n")))
	}()

	time.Sleep(10 * time.Second)
	conn.Close()
}

func runserverApart2() {
	const (
		connHost = ""
		connPort = "22347"
		connType = "tcp"
	)
	l, err := net.Listen(connType, connHost+":"+connPort)
	if err != nil {
		fmt.Println("Error listening:", err.Error())
		return
	}
	// Close the listener when the application closes.
	defer l.Close()
	fmt.Println("Listening on " + connHost + ":" + connPort)
	for {
		// Listen for an incoming connection.
		fmt.Println("listening............")
		conn, err := l.Accept()
		fmt.Println("............connected")
		if err != nil {
			fmt.Println("Error accepting: ", err.Error())
			return
		}
		// Handle connections in a new goroutine.
		go handleRequest2(conn)
	}
}

func main() {
	server := dbbus.Server{}
	done := make(chan bool)

	go runserverApart()
	go runserverApart2()

	go (func() {
		err := server.Start()
		if err != nil {
			done <- false
			panic(err)
		}
	})()

	time.Sleep(200 * time.Millisecond)

	server.RegisterSource(
		"test",
		"test-source",
		func(request *jsonrpc.Request) (interface{}, error) {
			return map[string]string{"success": "indeed"}, nil
		},
	)
	fmt.Println("Registred")
	<-done
}
