import { createConnection } from "typeorm"
import path from 'path'

export default async function getConnection(){
    const entities = [`${process.cwd()}/src/entities/*{.ts,.js}`]
    // In the event we are using a local connection use sqllite
    const options = {
        type: "sqlite",
        database: `${process.cwd()}/data/database.sqlite`,
        entities: entities,
        logging: true
    }
    return await createConnection(options)
}