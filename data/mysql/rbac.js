import logger from "../../utils/logger.js";
import knex from "./conn.js";
import { nanoid } from "nanoid";

let trx = await knex.transactionProvider()();
/**
 *
 * @param {object} regObj
 * @param {string} regObj.permission
 * @param {[string]} regObj.scopes
 * @param {string} regObj.lastSessID
 * @param {string} regObj.clientID
 */
let createPermission = async ({ newPermission, scopes, creatorID }) => {
  let prom = new Promise(async (resolve, rej) => {
    knex.transaction(async function (trx) {
      let accounts = await trx("accounts")
        .select("*")
        .where({ accountID: creatorID });
      let account = accounts[0];
      let roleIDs = [...account.roleIDs];
      let scopeIDs = [];
      for await (const roleID of roleIDs) {
        let result = await trx("roles").select("*").where({ roleID });
        scopeIDs.push(...result.map((roleObj) => roleObj.scopeIDs));
      }
      let scopeIDStr = scopeIDs.join(",");
      let currentSuchPermissions = await trx("permissions")
        .select("*")
        .where({ permission: "can_create_permission" })
        .andWhereRaw(
          `SELECT * FROM permissions where  JSON_OVERLAPS(JSON_ARRAY(${scopeIDStr}), JSON_EXTRACT(scopeIDs,"$"))`
        );
      let currentSuchPermission = currentSuchPermissions[0];
      let hasScope = !!currentSuchPermission?.permissionID;
      if (!hasScope) {
        return rej({ err: { msg: "No authorization to create permission" } });
      }

      let newScopeIDs = [];
      for (const item of newRoleScopes) {
        let scope = typeof item === "string" ? item : item.name;
        let prevSuchScopes = await trx.transaction(function (trx) {
          trx("scopes").select("*").whereRaw(`LOWER(scope)=${scope}`);
        });
        let prevSuchScope = prevSuchScopes[0];
        if (!prevSuchScope) {
          console.log("Ignore scope not yet existing");
          continue;
        }
        newScopeIDs.push(prevSuchScope.scopeID);
      }
      //check if role name already exists
      let prevSuchPermissions = await trx("permissions")
        .select("*")
        .whereRaw(`LOWER(permission)=${newPermission}`);
      let prevSuchPermission = prevSuchPermissions[0];
      if (prevSuchPermission) {
        let prevSuchScopes = prevSuchPermission.scopeIDs;
        prevSuchScopes.push(...newRoleScopes);
        await trx("roles")
          .update({ scopeIDs: JSON.stringify(scopeIDs) })
          .whereRaw(`LOWER(permission)=${newPermission}`);
        await trx.commit();
        return resolve({ info: "scopes added to existing permission" });
      }

      let permissionID = nanoid();
      await trx("permissions")
        .insert({ permissionID, permission: newPermission, scopes, creatorID })
        .on("query-error", function (error, obj) {
          logger.log("error", error);
          return rej({ msg: "Error creating login session." });
        });
      await trx.commit();
      resolve({ permissionID });
    });
  });
  return prom;
};

/**
 *
 * @param {*} param0
 * @param {trx} trx
 * @returns
 */
let createScope = async ({ scope, scopeDesc, scopeLabel, creatorID }, trx) => {
  let prom = new Promise(async (resolve, rej) => {
    trx = trx || (await knex.transactionProvider()());
    let { hasPermission, trx: trxFromHasPermission } = await checkPermission({
      accountID: creatorID,
      permission: "can_create_scope",
    });
    trx = trxFromHasPermission;
    let scopeID = nanoid();
    let prevSuchScopes = await trx
      .select("*")
      .from("scopes")
      .whereRaw(`LOWER(scope)='${scope}'`);
    let prevSuchScope = prevSuchScopes[0];
    console.log({ scope: "Here to scope", prevSuchScope });
    if (prevSuchScope) {
      return rej({ err: { msg: "Scope already exists" } });
    }
    await trx("scopes")
      .insert({ scopeID, scope, scopeDesc, scopeLabel, creatorID })
      .on("query-error", function (error, obj) {
        logger.log("error", error);
        return rej({ msg: "Error creating login session." });
      });
    await trx.commit();
    resolve({ scopeID });
  });
  return prom;
};

let createRole = async ({ creatorID, newRole, newRoleScopes }) => {
  let prom = new Promise(async (resolve, rej) => {
    knex.transaction(async function (trx) {
      try {
        let accounts = await trx("accounts")
          .select("*")
          .where({ accountID: creatorID });
        let account = accounts[0];
        if (!account) {
          return rej({ info: "creatorID does not exist" });
        }

        let { trx: trxFromHasPermission } = await checkPermission(
          { accountID: creatorID, permission: "can_create_role" },
          trx
        );
        trx = trxFromHasPermission;
        let newScopeIDs = [];
        for (const item of newRoleScopes) {
          let scope = typeof item === "string" ? item : item.name;
          let prevSuchScopes = await trx("scopes")
            .select("*")
            .whereRaw(`LOWER(scope)='${scope}'`);
          let prevSuchScope = prevSuchScopes[0];
          if (prevSuchScope) {
            newScopeIDs.push(prevSuchScope.scopeID);
            continue;
          }
          let scopeID = nanoid();
          let result = await trx("scopes")
            .insert({
              scopeID,
              scope,
              scopeDesc: item?.scopeDesc,
              scopeLabel: item?.scopeLabel,
              creatorID,
            })
            .on("query-error", function (error, obj) {
              console.log(error);
              return rej({ msg: "Error creating scope data." });
            });
          newScopeIDs.push(scopeID);
        }
        //check if role name already exists
        let prevSuchRoles = await trx("roles")
          .select("*")
          .whereRaw(`LOWER(role)='${newRole}'`);
        let prevSuchRole = prevSuchRoles[0];
        if (prevSuchRole) {
          let prevSuchScopes = prevSuchRole.scopeIDs;
          prevSuchScopes.push(...newScopeIDs);
          await trx("roles")
            .update({ scopeIDs: JSON.stringify(scopeIDs) })
            .whereRaw(`LOWER(role)='${newRole}'`);
          await trx.commit();
          return resolve({ info: "scopes added to existing role" });
        }
        let roleID = nanoid();
        await trx("roles").insert({
          roleID,
          role: newRole,
          scopeIDs: JSON.stringify(newScopeIDs),
          creatorID,
        });
        await trx.commit();
        resolve({ info: "Role and scopes added", roleID });
      } catch (error) {
        console.log(error);
        rej({ err: error });
      }
    });
  });
  return prom;
};

let deleteRole = async ({ effectorAccountID, roleToDelete }) => {
  let prom = new Promise(async (resolve, rej) => {
    knex.transaction(async function (trx) {
      try {
        let accounts = await trx("accounts")
          .select("*")
          .where({ accountID: effectorAccountID });
        let account = accounts[0];
        if (!account) {
          return rej({ info: "creatorID does not exist" });
        }

        let { trx: trxFromHasPermission } = await checkPermission(
          { accountID: effectorAccountID, permission: "can_delete_role" },
          trx
        );
        trx = trxFromHasPermission;
        //check if role name already exists
        let deleteNumber = await trx("roles")
          .whereRaw(`LOWER(role)='${roleToDelete}'`)
          .del();
        await trx.commit();
        resolve({ info: "Role deleted", roleID });
      } catch (error) {
        console.log(error);
        rej({ err: error });
      }
    });
  });
  return prom;
};

let addScopesToPermission = async ({
  effectorAccountID,
  permissionID,
  scopesToAdd,
}) => {
  let prom = new Promise(async (resolve, rej) => {
    knex.transaction(async function (trx) {
      let accounts = await trx("accounts")
        .select("*")
        .where({ accountID: effectorAccountID });
      let account = accounts[0];
      if (!account) {
        return rej({ info: "creatorID does not exist" });
      }

      let { trx: trxFromHasPermission } = await checkPermission(
        {
          accountID: effectorAccountID,
          permission: "can_add_permission_scope",
        },
        trx
      );
      trx = trxFromHasPermission;

      let permissionInfo = await trx("permissions")
        .select("*")
        .where({ permissionID })
        .on("query-error", function (error, obj) {
          logger.log("error", error);
          return rej({ msg: "Error creating login session." });
        });
      let scopeIDs = permissionInfo.scopeIDs;

      for (const scope of scopesToAdd) {
        let scopes = await trx("scopes")
          .select("*")
          .where({ scope })
          .on("query-error", function (error, obj) {
            logger.log("error", error);
            return rej({ msg: "Error fetching scope Info." });
          });
        let scopeInfo = scopes[0];
        scopeIDs.push(scopeInfo.scopeID);
      }

      await trx("permissions")
        .update({ scopeIDs: JSON.stringify(scopeIDs) })
        .where({ permissionID })
        .on("query-error", function (error, obj) {
          logger.log("error", error);
          return rej({ msg: "Error creating login session." });
        });
      await trx.commit();
      resolve({ info: "Scopes added to permission" });
    });
  });
  return prom;
};

let addScopeToRole = async ({ rolesID, newScopes }) => {
  let prom = new Promise(async (resolve, rej) => {
    knex.transaction(async function (trx) {
      let roleInfo = await trx("roles")
        .select("*")
        .where({ permissionID })
        .on("query-error", function (error, obj) {
          logger.log("error", error);
          return rej({ msg: "Error creating login session." });
        });
      let scopes = roleInfo.scopes;
      scopes = [...roleInfo.scopes, ...newScopes];
      await trx("roles")
        .update({ scopes: JSON.stringify(scopes) })
        .where({ rolesID })
        .on("query-error", function (error, obj) {
          logger.log("error", error);
          return rej({ msg: "Error creating login session." });
        });
      await trx.commit();
      resolve({ updated: true });
    });
  });
  return prom;
};

let checkPermission = async ({ accountID, role, permission }, trx) => {
  try {
    trx = trx || (await knex.transactionProvider()());
    let roleIDs = [];
    let scopeIDs = [];
    if (accountID === "system") {
      let roles = ["admin"];
      for await (const role of roles) {
        let results = await trx("roles").select("*").where({ role });
        let result = results[0];
        scopeIDs.push(...result.scopeIDs);
      }
    } else {
      let accounts = await trx("accounts")
        .select("*")
        .where({ accountID })
        .on("query-error", function (error, obj) {
          console.log(error);
          throw { msg: "Error checking permission." };
        });

      let account = accounts[0];
      if (!account) {
        throw { msg: "No role, no permission" };
      }
      roleIDs = account.roleIDs;
    }
    if (!roleIDs) {
      throw { msg: `Account has no role for permission '${permission}' `, };
    }
    for await (const roleID of roleIDs) {
      let results = await trx("roles").select("*").where({ roleID });
      let result = results[0];
      scopeIDs.push(...result.scopeIDs);
    }

    let scopeIDStr = scopeIDs.map((sc) => `'${sc}'`).join(",");
    let permissionsFound = await trx("permissions")
      .select("*")
      .whereRaw(
        `permission='${permission}' AND  JSON_OVERLAPS(JSON_ARRAY(${scopeIDStr}), JSON_EXTRACT(scopeIDs,"$"))`
      )
      .on("query-error", function (error, obj) {
        console.log(error);
        throw { err: { msg: "Error checking permission." } };
      });
    if (!permissionsFound.length > 0) {
      throw { msg: "No permission." };
    }
    return { hasPermission: true, trx };
  } catch (error) {
    console.log({ error });
    throw error;
  }
};

let addRolesToAccount = async ({ creatorID, accountID, newRoles }) => {
  let prom = new Promise(async (resolve, rej) => {
    // let trx
    knex.transaction(async function (trx) {
      try {
        let { trx: trxFromHasPermission, hasPermission } =
          await checkPermission(
            {
              accountID: creatorID,
              permission: "can_add_role",
            },
            trx
          );
        trx = trxFromHasPermission;
        if (!hasPermission) {
          throw new Error({
            err: { msg: "Unable to verify access authorization" },
          });
        }
        let roleIDsToAdd = [];
        for (const newRole of newRoles) {
          let roles = await trx("roles").select("*").where({ role: newRole });
          let role = roles[0];
          if (role) {
            roleIDsToAdd.push(role.roleID);
          }
        }

        let accounts = await trx("accounts")
          .select("*")
          .where({ accountID })
          .on("query-error", function (error, obj) {
            console.log(error);
            rej({ msg: "Unknown error" });
          });
        let account = accounts[0];
        if (!account) {
          return rej({ msg: "Account does not exist." });
        }
        let oldRoleIDs = account.roleIDs || [];

        let combinedRoleIDs = [...oldRoleIDs, ...roleIDsToAdd];

        let response = await trx("accounts")
          .update({ roleIDs: JSON.stringify(combinedRoleIDs) })
          .where({ accountID })
          .on("query-error", function (error, obj) {
            console.log(error);
            rej({ msg: "Unknown error" });
          });
        console.log(response);
        await trx.commit();
        resolve({ info: "Added roles" });
      } catch (error) {
        console.log(error);
        throw error;
      }
    });
  });
  return prom;
};
let getPermissions = async (filters, trx) => {
  try {
  let  trx = await knex.transactionProvider()();
   let permissions= await trx.select("*").from("permissions");
   return permissions;
  } catch (error) {
    console.log(error);
    throw error
  }
};
export {
  createPermission as createPermissionMySQL,
  addScopesToPermission as addScopeMySQL,
  addScopeToRole as addScopeToRoleMySQL,
  createRole as createRoleMySQL,
  checkPermission as checkPermissionMySQL,
  addRolesToAccount as addRolesToAccountMySQL,
  createScope as createScopeMySQL,
  deleteRole as deleteRoleMySQL,
  addScopesToPermission as addScopesToPermissionMySQL,getPermissions as getPermissionsMySQL
};
