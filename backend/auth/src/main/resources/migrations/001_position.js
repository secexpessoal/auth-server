// Script de migração para mover a string 'position' legada para a coleção 'positions' e vincular via UUID
// Execute no mongosh: load('001_position.js')

db.user_profiles.find({ "position": { $exists: true, $ne: null } }).forEach(function(doc) {
    // 1. Garante que o cargo existe na coleção 'positions'
    var posName = doc.position;
    var positionDoc = db.positions.findOne({ name: posName });
    var posId;

    if (!positionDoc) {
        posId = UUID(); // Gera novo ID se não existir (nativo do mongosh)
        db.positions.insertOne({
            _id: posId,
            name: posName,
            is_active: true,
            created_at: new Date()
        });
        print("Novo cargo criado: " + posName + " com ID: " + posId);
    } else {
        posId = positionDoc._id;
    }

    // 2. Converte a string antiga para o objeto estruturado
    db.user_profiles.updateOne(
        { _id: doc._id },
        {
            $set: {
                "current_position": {
                    "position_id": posId,
                    "is_temporary": false,
                    "start_date": doc.updated_at || new Date(),
                    "previous_position_id": null
                }
            },
            $unset: { "position": "" }
        }
    );
    print("Perfil " + doc._id + " migrado para nova estrutura de cargo.");
});

// Padronização para quem não tem cargo
db.user_profiles.updateMany(
    { "current_position": { $exists: false } },
    { $set: { "current_position": null } }
);

print("Migração de cargos finalizada.");
