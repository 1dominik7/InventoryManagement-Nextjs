import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
const prisma = new PrismaClient();

async function deleteAllData(orderedFileNames: string[]) {
  // Define the deletion order based on foreign key constraints
  const deletionOrder = [
    "expenseByCategory.json", // Delete dependent data first
    "expenses.json",
    "expenseSummary.json",
    "sales.json",
    "salesSummary.json",
    "purchases.json",
    "purchaseSummary.json",
    "users.json",
    "products.json",
  ];

  for (const fileName of deletionOrder) {
    const modelName = path.basename(fileName, path.extname(fileName));
    const model: any = prisma[modelName as keyof typeof prisma];

    if (model) {
      try {
        await model.deleteMany({});
        console.log(`Cleared data from ${modelName}`);
      } catch (error: any) {
        console.error(
          `Error deleting data from ${modelName}: ${error.message}`
        );
      }
    } else {
      console.error(
        `Model ${modelName} not found. Please ensure the model name is correctly specified.`
      );
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  const orderedFileNames = [
    "products.json",
    "expenseSummary.json",
    "sales.json",
    "salesSummary.json",
    "purchases.json",
    "purchaseSummary.json",
    "users.json",
    "expenses.json",
    "expenseByCategory.json",
  ];

  // First, delete existing data in the correct order
  await deleteAllData(orderedFileNames);

  // Now, seed new data
  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model: any = prisma[modelName as keyof typeof prisma];

    if (!model) {
      console.error(`No Prisma model matches the file name: ${fileName}`);
      continue;
    }

    for (const data of jsonData) {
      try {
        await model.create({
          data,
        });
        console.log(`Seeded ${modelName} with data from ${fileName}`);
      } catch (error: any) {
        console.error(`Error seeding ${modelName}: ${error.message}`);
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
