FROM golang:1.22 AS build

WORKDIR /src

COPY go.mod ./
COPY go.sum ./
COPY configs ./configs
COPY cmd ./cmd
COPY internal ./internal

RUN go build -o /bin/portal ./cmd/portal

FROM gcr.io/distroless/base-debian12

COPY --from=build /bin/portal /bin/portal
COPY configs /etc/portal/configs

ENV PORTAL__CONFIG__FILE=/etc/portal/configs/app.yaml

EXPOSE 8080

ENTRYPOINT ["/bin/portal"]
