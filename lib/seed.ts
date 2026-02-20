import connectDB from './mongodb';
import {
  BoardModel,
  ThoughtModel,
  EvidenceModel,
  EvidenceLinkModel,
  ConnectionModel,
  CommentModel,
  AIActionModel,
  AIInsightModel,
} from './models';
import {
  seedBoard,
  seedThoughts,
  seedEvidence,
  seedEvidenceLinks,
  seedConnections,
  seedComments,
  seedAIActions,
  seedAIInsights,
} from './seed-data';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to MongoDB
    await connectDB();
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      BoardModel.deleteMany({}),
      ThoughtModel.deleteMany({}),
      EvidenceModel.deleteMany({}),
      EvidenceLinkModel.deleteMany({}),
      ConnectionModel.deleteMany({}),
      CommentModel.deleteMany({}),
      AIActionModel.deleteMany({}),
      AIInsightModel.deleteMany({}),
    ]);
    
    // Insert seed data
    console.log('📝 Inserting seed data...');
    
    await BoardModel.create(seedBoard);
    console.log('✅ Board created');
    
    await ThoughtModel.insertMany(seedThoughts);
    console.log(`✅ ${seedThoughts.length} thoughts created`);
    
    await EvidenceModel.insertMany(seedEvidence);
    console.log(`✅ ${seedEvidence.length} evidence items created`);
    
    await EvidenceLinkModel.insertMany(seedEvidenceLinks);
    console.log(`✅ ${seedEvidenceLinks.length} evidence links created`);
    
    await ConnectionModel.insertMany(seedConnections);
    console.log(`✅ ${seedConnections.length} connections created`);
    
    await CommentModel.insertMany(seedComments);
    console.log(`✅ ${seedComments.length} comments created`);
    
    await AIActionModel.insertMany(seedAIActions);
    console.log(`✅ ${seedAIActions.length} AI actions created`);
    
    await AIInsightModel.insertMany(seedAIInsights);
    console.log(`✅ ${seedAIInsights.length} AI insights created`);
    
    console.log('🎉 Database seeded successfully!');
    
    return {
      success: true,
      counts: {
        boards: 1,
        thoughts: seedThoughts.length,
        evidence: seedEvidence.length,
        evidenceLinks: seedEvidenceLinks.length,
        connections: seedConnections.length,
        comments: seedComments.length,
        aiActions: seedAIActions.length,
        aiInsights: seedAIInsights.length,
      },
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}
