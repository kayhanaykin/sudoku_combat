#include "../tools/asio.hpp"
#include "../tools/crow_all.h"

int main()
{
    crow::SimpleApp app;

    CROW_ROUTE(app, "/api/stats/healthz")([]() {
        crow::json::wvalue res;
        res["status"] = "ok";
        return crow::response(res);
    });

    app.port(8090).multithreaded().run();
    return 0;
}
