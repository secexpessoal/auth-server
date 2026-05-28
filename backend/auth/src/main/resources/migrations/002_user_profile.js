// Script de migração para renomear o campo 'userData' para 'user_profile' na coleção 'users'
// Execute no mongosh: load('002_user_profile.js')

db.users.find({ "userData": { $exists: true } }).forEach(function(doc) {
    db.users.updateOne(
        { _id: doc._id },
        { 
            $set: { "user_profile": doc.userData },
            $unset: { "userData": "" }
        }
    );
    print("Usuário " + doc._id + ": campo 'userData' migrado para 'user_profile'.");
});

// Garante que todos os usuários tenham o campo, nem que seja null
db.users.updateMany(
    { "user_profile": { $exists: false } },
    { $set: { "user_profile": null } }
);

print("Migração de 'userData' para 'user_profile' finalizada com sucesso.");
