from ariadne import (
    load_schema_from_path,
    make_executable_schema,
    QueryType,
    MutationType,
)
from ariadne.asgi import GraphQL
from app.graphql.graphql_helper import (
    accounts_master_helper,
    accounts_opening_balance_helper,
    balance_sheet_profit_loss_helper,
    change_pwd_helper,
    change_uid_helper,
    create_bu_helper,
    decode_ext_db_params_helper,
    generic_query_helper,
    generic_update_helper,
    generic_update_query_helper,
    import_secured_controls_helper,
    product_categories_helper,
    trial_balance_helper,
    update_client_helper,
    update_user_helper,
)

type_defs = load_schema_from_path(".")
query = QueryType()
mutation = MutationType()


@query.field("accountsMaster")
async def accounts_master(_, info, dbName="", value=""):
    return await accounts_master_helper(info, dbName, value)


@query.field("accountsOpeningBalance")
async def accounts_opening_balance(_, info, dbName="", value=""):
    return await accounts_opening_balance_helper(info, dbName, value)


@query.field("balanceSheetProfitLoss")
async def balance_sheet_profit_loss(_, info, dbName="", value=""):
    return await balance_sheet_profit_loss_helper(info, dbName, value)


@query.field("decodeExtDbParams")
async def decode_ext_db_params(_, info, value=""):
    return await decode_ext_db_params_helper(info, value)


@query.field("genericQuery")
async def generic_query(_, info, dbName="", value=""):
    return await generic_query_helper(info, dbName, value)


@query.field("productCategories")
async def product_categories(_, info, dbName="", value=""):
    return await product_categories_helper(info, dbName, value)


@query.field("trialBalance")
async def trial_balance(_, info, dbName="", value=""):
    return await trial_balance_helper(info, dbName, value)


@mutation.field("changePwd")
async def change_pwd(_, info, value=""):
    return await change_pwd_helper(info, value)


@mutation.field("changeUid")
async def change_uid(_, info, value):
    return await change_uid_helper(info, value)


@mutation.field("createBu")
async def create_bu(_, info, value=""):
    return await create_bu_helper(info, value)


@mutation.field("genericUpdate")
async def generic_update(_, info, dbName="", value=""):
    return await generic_update_helper(info, dbName, value)


@mutation.field("genericUpdateQuery")
async def generic_update_query(_, info, dbName="", value=""):
    return await generic_update_query_helper(info, dbName, value)


@mutation.field("importSecuredControls")
async def import_secured_controls(_, info, value):
    return await import_secured_controls_helper(info, value)


@mutation.field("updateClient")
async def update_client(_, info, value=""):
    return await update_client_helper(info, value)


@mutation.field("updateUser")
async def update_user(_, info, value=""):
    return await update_user_helper(info, value)


@query.field("hello")
async def hello(_, info):
    return {"status": "Hello world"}


schema = make_executable_schema(type_defs, query, mutation)
GraphQLApp: GraphQL = GraphQL(schema)
