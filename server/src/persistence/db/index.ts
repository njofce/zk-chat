import { connect } from "mongoose";
import config from "../../config"

export const initDb = async () => {
    await connect(config.DB_CONNECTION_STRING, { useNewUrlParser: true });
};