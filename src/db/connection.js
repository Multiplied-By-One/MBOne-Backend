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
    
    const  options = process?.env?.SERVERLESS_STAGE === "localdev" ? 
        // In the event we are using a local connection use sqllite
        {
            type: "sqlite",
            database: `${process.cwd()}/data/database.sqlite`,
            entities: entities,
            logging: true,
            // synchronize: true,
            // cache: false,
        } :
        {
            type: 'aurora-data-api',
            database: process.env.DB_NAME,
            secretArn: process.env.DB_SECRET_ARN,
            resourceArn: process.env.DB_CLUSTER_ARN,
            region: process.env.SERVERLESS_REGION
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