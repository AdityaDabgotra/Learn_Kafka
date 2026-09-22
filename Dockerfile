FROM zookeeper:latest

EXPOSE 2181

CMD ["zkServer.sh", "start-foreground"]