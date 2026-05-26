// Script de migração para mover a string 'position' legada para a coleção 'positions' e vincular via UUID
// Execute no mongosh: load('001_position.js')

// Helper para gerar UUID V4 (já que o mongo nativo não tem V7 fácil no shell)
function generateUUID() {
    return UUID();
}

// 1. Busca todos os nomes de cargos únicos em user_profiles
var uniquePositions = db.user_profiles.distinct("position", { "position": { $exists: true, $ne: null } });

// 2. Cria os cargos no catálogo e mapeia os IDs
var positionMap = {};

uniquePositions.forEach(function(name) {
    // Verifica se o cargo já existe para evitar duplicatas
    var existing = db.positions.findOne({ name: name });
    if (existing) {
        positionMap[name] = existing._id;
    } else {
        var newId = generateUUID();
        db.positions.insertOne({
            _id: newId,
            name: name,
            is_active: true,
            created_at: new Date()
        });
        positionMap[name] = newId;
    }
});

// 3. Atualiza os perfis de usuário para usar position_id em vez da string antiga
db.user_profiles.find({ "position": { $exists: true, $ne: null } }).forEach(function(doc) {
    var posId = positionMap[doc.position];
    if (posId) {
        db.user_profiles.updateOne(
            { _id: doc._id },
            {
                $set: {
                    "current_position": {
                        "position_id": posId,
                        "is_temporary": false,
                        "start_date": doc.updated_at || new Date()
                    }
                },
                $unset: { "position": "" }
            }
        );
        print("Usuário migrado: " + doc._id + " para Position ID: " + posId);
    }
});

// 4. Limpeza e padronização final
db.user_profiles.updateMany(
    { "current_position": { $exists: false } },
    { $set: { "current_position": null } }
);

db.user_profiles.updateMany(
    { "position": { $exists: true } },
    { $unset: { "position": "" } }
);

// Remove a coleção de sequências se existir, pois não é mais necessária
db.database_sequences.drop();
