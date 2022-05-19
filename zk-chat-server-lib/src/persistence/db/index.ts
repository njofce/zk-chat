import { connect } from "mongoose";

export const initDb = async (connectionString: string) => {
    await connect(connectionString, { useNewUrlParser: true });
};