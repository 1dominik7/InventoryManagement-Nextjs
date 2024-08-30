"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
function deleteAllData(orderedFileNames) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
            const model = prisma[modelName];
            if (model) {
                try {
                    yield model.deleteMany({});
                    console.log(`Cleared data from ${modelName}`);
                }
                catch (error) {
                    console.error(`Error deleting data from ${modelName}: ${error.message}`);
                }
            }
            else {
                console.error(`Model ${modelName} not found. Please ensure the model name is correctly specified.`);
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const dataDirectory = path_1.default.join(__dirname, "seedData");
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
        yield deleteAllData(orderedFileNames);
        // Now, seed new data
        for (const fileName of orderedFileNames) {
            const filePath = path_1.default.join(dataDirectory, fileName);
            const jsonData = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
            const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
            const model = prisma[modelName];
            if (!model) {
                console.error(`No Prisma model matches the file name: ${fileName}`);
                continue;
            }
            for (const data of jsonData) {
                try {
                    yield model.create({
                        data,
                    });
                    console.log(`Seeded ${modelName} with data from ${fileName}`);
                }
                catch (error) {
                    console.error(`Error seeding ${modelName}: ${error.message}`);
                }
            }
        }
    });
}
main()
    .catch((e) => {
    console.error(e);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
