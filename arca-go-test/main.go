package main

import (
	"fmt"
	"time"

	dbbus "github.com/m3co/arca-dbbus"
	jsonrpc "github.com/m3co/arca-jsonrpc"
)

func main() {
	server := dbbus.Server{}
	done := make(chan bool)

	go (func() {
		err := server.Start()
		if err != nil {
			done <- false
			panic(err)
		}
	})()

	time.Sleep(100 * time.Millisecond)
	handler := func(request *jsonrpc.Request) (interface{}, error) {
		return map[string]string{"success": "indeed"}, nil
	}

	server.RegisterSource("test", "test-source", handler)
	fmt.Println("Registred")
	<-done
}
