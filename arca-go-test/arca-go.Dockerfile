
FROM golang:latest

RUN go get github.com/m3co/arca-dbbus

RUN mkdir /app
WORKDIR /app

ADD ./arca-go-test/main.go .

RUN go build main.go

EXPOSE 22345

CMD ["./main"]
