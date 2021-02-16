import { createConnection } from "typeorm"
import entities from './entities'

export default async function getConnection(){
    // In the event we are using a local connection use sqllite
    const options = {
        type: "sqlite",
        database: `${process.cwd()}/data/database.sqlite`,
        entities: entities,
        logging: true
    }
    return await createConnection(options)
}