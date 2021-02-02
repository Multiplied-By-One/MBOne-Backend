import { createConnection } from "typeorm"

const entities = `${__dirname}/../entities/*.ts`

// In the event we are using a local connection use sqllite
const options = {
    type: "sqlite",
    database: `${__dirname}/../../data/database.sqlite`,
    entities: entities,
    logging: true
}

export default async function getConnection(){
    return await createConnection(options)
}