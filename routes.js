"use strict";
module.exports = function(app, modules){
    require("./routes/auth")(app, modules);
    require("./routes/users")(app, modules);
    require("./routes/entity")(app, modules);
    require("./routes/orchestrator")(app, modules);
    app.get("/", function(req, res){//health check
        res.send({
            status: true
        });
    });
};