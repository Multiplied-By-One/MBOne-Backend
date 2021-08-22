import { createConnection, getConnection as getConn } from "typeorm"
import entities from './entities'

export default async function getConnection(){
    let conn = null;
    try{
        conn = getConn()
    } catch (e){}

    // In the event the current connection is not null use it!
    if(conn !== null){
        return conn
    }

    // In the event we are using a local connection use sqllite
    const options = {
        type: "sqlite",
        database: `${process.cwd()}/data/database.sqlite`,
        entities: entities,
        logging: true,
        // synchronize: true,
        // cache: false,
    }
    conn = await createConnection(options)
    return conn
}

// Close connection if we need to after request
export async function closeConnection(){
    try{
        conn = getConn()
        await conn.close()
    } catch (e){}
}