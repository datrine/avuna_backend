import knexJs from "knex";
import {v4 as  uuidV4} from "uuid";
import {config} from "dotenv";
config()
let {DB_HOST,DB_USERNAME,DB_PASSWORD,DB_NAME,DB_PORT}=process.env

const knex = knexJs({
  client: "mysql2",
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database:DB_NAME,
  },
});

knex.schema.hasTable("accounts").then(function (exists) {
  if (!exists) {
    return knex.schema.createTable("accounts", function (t) {
      t.uuid("accountID");
      t.string("email").primary();
      t.string("pass_hash", 100);
      t.json("state");
      t.boolean("isEmailVerified").defaultTo(false);
      t.string("account_type");
      t.json("roleIDs");
      t.timestamp("createdAt").defaultTo(knex.fn.now());
      t.timestamp("updatedAt").defaultTo(knex.fn.now());
    });
  }
});

knex.schema.hasTable("user_bios").then(function (exists) {
  if (!exists) {
    return knex.schema.createTable("user_bios", function (t) {
      t.string("accountID").primary();
      t.string("f_name");
      t.string("l_name");
      t.enum("sex", ["male", "female"]);
      t.enum("age_range",["20-29","30-39","40-49"]);
      t.string("country");
      t.timestamp("createdAt").defaultTo(knex.fn.now());
      t.timestamp("updatedAt").defaultTo(knex.fn.now());
    });
  }
});

knex.schema.hasTable("login_sessions").then(function (exists) {
  if (!exists) {
    return knex.schema.createTable("login_sessions", function (t) {
      t.uuid("sessID").primary();
      t.uuid("clientID");
      t.string("accountID");
      t.json("state");
      t.string("lastSessID");
      t.double("duration");
      t.json("factors_info");
      t.json("request_info");
      t.timestamp("started_on");
      t.timestamp("renewed_on");
      t.timestamp("end_by");
      t.timestamp("createdAt").defaultTo(knex.fn.now());
      t.timestamp("updatedAt").defaultTo(knex.fn.now());
    });
  }
});

knex.schema.hasTable("tokens").then(function (exists) {
  if (!exists) {
    return knex.schema.createTable("tokens", function (t) {
      t.uuid("sessID");
      t.uuid("clientID").unique();
      t.text("accessToken");
      t.string("refreshToken");
      t.timestamp("createdAt").defaultTo(knex.fn.now());
      t.timestamp("updatedAt").defaultTo(knex.fn.now());
    });
  }
});

knex.schema.hasTable("temp_tokens").then(function (exists) {
  if (!exists) {
    return knex.schema.createTable("temp_tokens", function (t) {
      t.string("tokenType");
      t.string("token").unique();
      t.string("scope");
      t.string("recipient");
      t.integer("ttl");
      t.timestamp("expiresAt");
      t.string("state");
      t.timestamp("verifiedAt");
      t.timestamp("createdAt").defaultTo(knex.fn.now());
      t.timestamp("updatedAt").defaultTo(knex.fn.now());
    });
  }
});

knex.schema.hasTable("permissions").then(function (exists) {
  if (!exists) {
    return knex.schema.createTable("permissions", function (t) {
      t.string("permissionID").primary();
      t.string("permission").unique();
      t.string("permissionLabel");
      t.text("permissionDesc");
      t.string("creatorID");
      t.json("scopeIDs");
      t.timestamp("createdAt").defaultTo(knex.fn.now());
      t.timestamp("updatedAt").defaultTo(knex.fn.now());
    });
  }
});

knex.schema.hasTable("roles").then(function (exists) {
  if (!exists) {
    return knex.schema.createTable("roles", function (t) {
      t.string("roleID").primary();
      t.string("role").unique();
      t.string("roleLabel");
      t.text("roleDesc");
      t.json("scopeIDs");
      t.string("creatorID");
      t.timestamp("createdAt").defaultTo(knex.fn.now());
      t.timestamp("updatedAt").defaultTo(knex.fn.now());
    });
  }

});

knex.schema.hasTable("scopes").then(function (exists) {
  if (!exists) {
    return knex.schema.createTable("scopes", function (t) {
      t.string("scopeID").primary();
      t.string("scope");
      t.string("scopeLabel");
      t.string("scopeDesc");
      t.string("creatorID");
      t.timestamp("createdAt").defaultTo(knex.fn.now());
      t.timestamp("updatedAt").defaultTo(knex.fn.now());
    });
  }

});

knex.schema.hasTable("courses").then(function (exists) {
  if (!exists) {
    return knex.schema.createTable("courses", function (t) {
      t.string("courseID").primary();
      t.string("code").unique();
      t.string("title");
      t.string("desc");
      t.json("state");
      t.string("creatorID");
      t.json("editHistory");
      t.timestamp("createdAt").defaultTo(knex.fn.now());
      t.timestamp("updatedAt").defaultTo(knex.fn.now());
    });
  }
});

knex.schema.hasTable("content").then(function (exists) {
  if (!exists) {
    return knex.schema.createTable("content", function (t) {
      t.string("contentID").primary();
      t.string("courseID");
      t.string("title");
      t.string("desc");
      t.json("media");
      t.string("creatorID");
      t.enum("mode",["publish","draft"]);
      t.timestamp("createdAt").defaultTo(knex.fn.now());
      t.timestamp("updatedAt").defaultTo(knex.fn.now());
    });
  }
});

knex.schema.hasTable("rating").then(function (exists) {
  if (!exists) {
    return knex.schema.createTable("rating", function (t) {
      t.string("ratingID");
      t.string("contentID");
      t.string("rater");
      t.decimal("stars");
      t.timestamp("createdAt").defaultTo(knex.fn.now());
      t.timestamp("updatedAt").defaultTo(knex.fn.now());
    });
  }
});

knex.schema.hasTable("rating").then(function (exists) {
  if (!exists) {
    return knex.schema.createTable("rating", function (t) {
      t.string("ratingID");
      t.string("contentID");
      t.string("rater");
      t.decimal("stars");
      t.timestamp("createdAt").defaultTo(knex.fn.now());
      t.timestamp("updatedAt").defaultTo(knex.fn.now());
    });
  }
});

knex.schema.hasTable("businesses").then(function (exists) {
  if (!exists) {
    return knex.schema.createTable("businesses", function (t) {
      t.string("businessID").primary();
      t.string("name");
      t.string("sector");
      t.string("size");
      t.string("creatorID");
      t.decimal("phone_num");
      t.timestamp("createdAt").defaultTo(knex.fn.now());
      t.timestamp("updatedAt").defaultTo(knex.fn.now());
    });
  }
});
export default knex;
