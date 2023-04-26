import { createAppServer } from "./create_server";

const main = async () => {

    const app = createAppServer();

    app.listen(5567, () => {
        console.log(`The app server is running on port ${5567}!`);
    });
}

main()