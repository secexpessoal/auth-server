// Script de migração para renomear o campo 'userData' para 'user_profile' na coleção 'users'
// Execute no mongosh: load('002_user_profile.js')

db.users.updateMany(
    { "userData": { $exists: true } },
    { $rename: { "userData": "user_profile" } }
);

print("Migração de 'userData' para 'user_profile' na coleção 'users' concluída.");
