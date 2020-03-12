package main

import (
	"encoding/json"
	"fmt"
	"time"

	"net"

	dbbus "github.com/m3co/arca-dbbus"
	jsonrpc "github.com/m3co/arca-jsonrpc"
)

// Handles incoming requests.
func handleRequest(conn net.Conn) {
	// Make a buffer to hold incoming data.
	response := jsonrpc.Response{}
	response.ID = "id-of-error"
	response.Method = "error-in-the-middle"
	response.Context = map[string]string{
		"Source": "test",
	}
	response.Result = map[string]string{
		"Message": "this is the message",
	}
	responseMsg, _ := json.Marshal(response)

	buf := make([]byte, 1024)
	// Read the incoming connection into the buffer.
	_, err := conn.Read(buf)
	if err != nil {
		fmt.Println("Error reading:", err.Error())
		return
	}

	// Send a response back to person contacting us.
	firstHalfMsg := responseMsg[:100]
	lastHalfMsg := responseMsg[100:]

	fmt.Println(string(firstHalfMsg))
	conn.Write(firstHalfMsg)

	fmt.Println("waiting...")
	time.Sleep(100 * time.Millisecond)

	fmt.Println(string(lastHalfMsg))
	conn.Write(lastHalfMsg)

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

func main() {
	server := dbbus.Server{}
	done := make(chan bool)

	go runserverApart()

	go (func() {
		err := server.Start()
		if err != nil {
			done <- false
			panic(err)
		}
	})()

	time.Sleep(100 * time.Millisecond)

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
