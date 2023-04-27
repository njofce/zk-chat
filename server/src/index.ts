import { createAppServer } from "./create_server";

const main = async () => {

    const app = createAppServer();

    app.listen(3002, () => {
        console.log(`The app server is running on port ${3002}!`);
    });
}

main()