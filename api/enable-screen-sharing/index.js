const { TableClient } = require("@azure/data-tables");
const { getEmail, blockNonTeacherMember } = require("./checkMember");


const chatStorageAccountConnectionString = process.env.chatStorageAccountConnectionString;

const classesTableClient = TableClient.fromConnectionString(chatStorageAccountConnectionString, "classes");
const sessionsTableClient = TableClient.fromConnectionString(chatStorageAccountConnectionString, "sessions");


module.exports = async function (context, req) {

    const teacherEmail = getEmail(req);
    await blockNonTeacherMember(teacherEmail, context);

    const classId = req.query.classId;

    let continuationToken = null;
    let pageEntities = undefined;
    let entities = [];
    do {
        const page = await classesTableClient.listEntities({
            queryOptions: {
                filter: `PartitionKey eq '${classId}'`
            }
        }).byPage({ maxPageSize: 100, continuationToken: continuationToken }).next();
        pageEntities = page.value;
        if (!pageEntities) break;
        continuationToken = pageEntities.continuationToken;
        entities = entities.concat(pageEntities);
    }
    while (continuationToken !== undefined);

    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        context.log(entity);
        const studentEmail = entity.rowKey;
        context.log(studentEmail);
        await sessionsTableClient.upsertEntity(
            {
                partitionKey: studentEmail,
                rowKey: studentEmail,
                TeacherEmail: teacherEmail
            }, "Replace"
        );
    }

    const emails = entities.map(entity => entity.RowKey);

    context.res.json({ message: "ok", emails });
}