import { createConnection } from "typeorm"
import entities from './entities'

let conn = null
export default async function getConnection(){
    //Cache connection on a per request basis using closure
    if(conn !== null){
        return conn
    }
    // In the event we are using a local connection use sqllite
    const options = {
        type: "sqlite",
        database: `${process.cwd()}/data/database.sqlite`,
        entities: entities,
        logging: true
    }
    conn = await createConnection(options)
    return conn
}