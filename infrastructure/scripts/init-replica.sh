#!/bin/sh
set -eu

echo "Esperando a MongoDB..."

until mongosh --host mongodb:27017 --quiet --eval "db.adminCommand({ ping: 1 }).ok" >/dev/null 2>&1; do
  sleep 2
done

echo "Verificando replica set..."

mongosh --host mongodb:27017 --quiet --eval '
try {
  rs.status();
  print("Replica set ya inicializado");
} catch (error) {
  if (error.codeName === "NotYetInitialized") {
    rs.initiate({
      _id: "rs0",
      members: [{ _id: 0, host: "mongodb:27017" }]
    });
    print("Replica set inicializado");
  } else {
    throw error;
  }
}
'

echo "Inicializacion de MongoDB finalizada"
