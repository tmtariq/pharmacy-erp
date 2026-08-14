import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pharmacy from './models/Pharmacy.js';
import Branch from './models/Branch.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Supplier from './models/Supplier.js';
import Medicine from './models/Medicine.js';
import Batch from './models/Batch.js';
import Customer from './models/Customer.js';
import Sale from './models/Sale.js';
import Prescription from './models/Prescription.js';
import SuperAdmin from './models/SuperAdmin.js';
import connectDB from './config/db.js';

dotenv.config({ path: './backend/.env' });
dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🧹 Clearing existing collections...');

    // Safe drop indexes to remove legacy single-field unique constraints
    try { await Category.collection.dropIndexes(); } catch (e) {}
    try { await Medicine.collection.dropIndexes(); } catch (e) {}
    try { await User.collection.dropIndexes(); } catch (e) {}
    try { await SuperAdmin.collection.dropIndexes(); } catch (e) {}

    await Pharmacy.deleteMany({});
    await Branch.deleteMany({});
    await User.deleteMany({});
    await SuperAdmin.deleteMany({});
    await Category.deleteMany({});
    await Supplier.deleteMany({});
    await Medicine.deleteMany({});
    await Batch.deleteMany({});
    await Customer.deleteMany({});
    await Sale.deleteMany({});
    await Prescription.deleteMany({});

    console.log('🏬 Creating Pharmacy Tenants and Branches...');

    // 1. Tenant 1: Main Enterprise Pharmacy Chain
    const pharmacy1 = await Pharmacy.create({
      name: 'HealthCare Plus Pharmacy Chain',
      code: 'HCPLUS',
      licenseNumber: 'PHAR-HC-99281',
      taxId: 'TAX-8819203',
      phone: '+1 800 555 0199',
      address: '100 Medical Blvd, Healthcare City',
      plan: 'Enterprise',
      subscriptionStatus: 'active',
      companyStatus: 'Active',
      isActive: true
    });

    const branch1_1 = await Branch.create({
      name: 'HealthCare Plus Main HQ',
      code: 'HQ-01',
      pharmacy: pharmacy1._id,
      phone: '+1 800 555 0199',
      address: '100 Medical Blvd, Suite 100',
      isHeadquarter: true
    });

    const branch1_2 = await Branch.create({
      name: 'HealthCare Plus Downtown Branch',
      code: 'BR-02',
      pharmacy: pharmacy1._id,
      phone: '+1 800 555 0200',
      address: '450 Downtown St, Plaza Center',
      isHeadquarter: false
    });

    // 2. Tenant 2: MedixCare Pharmacy
    const pharmacy2 = await Pharmacy.create({
      name: 'MedixCare Wellness Store',
      code: 'MEDIX',
      licenseNumber: 'PHAR-MX-11029',
      taxId: 'TAX-9920192',
      phone: '+1 800 555 0300',
      address: '77 Wellness Ave, Careville',
      plan: 'Professional',
      subscriptionStatus: 'active',
      companyStatus: 'Active',
      isActive: true
    });

    const branch2_1 = await Branch.create({
      name: 'MedixCare Central Branch',
      code: 'MX-01',
      pharmacy: pharmacy2._id,
      phone: '+1 800 555 0301',
      address: '77 Wellness Ave, Central Wing',
      isHeadquarter: true
    });

    console.log('👑 Creating Pharmacy Users...');

    // 0. System Super Admin (SaaS Platform Controller) - Generic Gmail Account
    const superAdmin = await User.create({
      name: 'System Super Admin',
      email: 'saasadmin@gmail.com',
      password: 'SuperAdminPass@2026!',
      role: 'SuperAdmin',
      pharmacy: pharmacy1._id,
      branch: branch1_1._id,
      assignedBranches: [branch1_1._id, branch1_2._id],
      phone: '+1 800 555 9999'
    });

    // 0.1 Dedicated SuperAdmin Platform Operator (for /saas-admin login)
    await SuperAdmin.create({
      name: 'SaaS Platform Operator',
      email: 'saasadmin@gmail.com',
      password: 'SuperAdminPass@2026!',
      role: 'SuperAdmin',
      permissions: ['ALL_PERMISSIONS'],
      status: 'active'
    });

    // 1. Company Owner (Enterprise Control) - Generic Gmail Account
    const owner1 = await User.create({
      name: 'Sarah Jenkins (Company Owner)',
      email: 'companyowner@gmail.com',
      password: 'OwnerPass@2026!',
      role: 'Owner',
      pharmacy: pharmacy1._id,
      branch: branch1_1._id,
      assignedBranches: [branch1_1._id, branch1_2._id],
      phone: '+1 555 0111'
    });

    // 2. Branch Manager (Main HQ Branch)
    const branchManager1 = await User.create({
      name: 'David Ross (HQ Branch Manager)',
      email: 'branchmanager@gmail.com',
      password: 'ManagerPass@2026!',
      role: 'Branch Manager',
      pharmacy: pharmacy1._id,
      branch: branch1_1._id,
      assignedBranches: [branch1_1._id],
      phone: '+1 555 0115'
    });

    // 3. Branch Manager (Downtown Branch Outlet)
    const branchManager2 = await User.create({
      name: 'Elena Rostova (Downtown Branch Manager)',
      email: 'manager.downtown@gmail.com',
      password: 'ManagerPass@2026!',
      role: 'Branch Manager',
      pharmacy: pharmacy1._id,
      branch: branch1_2._id,
      assignedBranches: [branch1_2._id],
      phone: '+1 555 0116'
    });

    // 4. Clinical Pharmacist
    const pharmacist1 = await User.create({
      name: 'Dr. Michael Chang (Pharmacist)',
      email: 'pharmacist@gmail.com',
      password: 'PharmPass@2026!',
      role: 'Pharmacist',
      pharmacy: pharmacy1._id,
      branch: branch1_1._id,
      assignedBranches: [branch1_1._id],
      phone: '+1 555 0112'
    });

    // 5. Cashier (POS Terminal)
    const cashier1 = await User.create({
      name: 'Alex Rivera (POS Cashier)',
      email: 'cashier@gmail.com',
      password: 'CashierPass@2026!',
      role: 'Cashier',
      pharmacy: pharmacy1._id,
      branch: branch1_1._id,
      assignedBranches: [branch1_1._id],
      phone: '+1 555 0113'
    });

    // 6. Inventory Staff (Inventory Manager role)
    const inventory1 = await User.create({
      name: 'Marcus Vance (Inventory Manager)',
      email: 'inventory@gmail.com',
      password: 'InventoryPass@2026!',
      role: 'Inventory Manager',
      pharmacy: pharmacy1._id,
      branch: branch1_1._id,
      assignedBranches: [branch1_1._id],
      phone: '+1 555 0117'
    });

    // 7. Delivery Staff
    const delivery1 = await User.create({
      name: 'Tariq Mahmood (Delivery Driver)',
      email: 'delivery@gmail.com',
      password: 'DeliveryPass@2026!',
      role: 'Delivery Staff',
      pharmacy: pharmacy1._id,
      branch: branch1_1._id,
      assignedBranches: [branch1_1._id],
      phone: '+1 555 0118'
    });

    // 8. Customer Account
    const customerUser1 = await User.create({
      name: 'John Customer (Patient Portal)',
      email: 'customer@gmail.com',
      password: 'CustomerPass@2026!',
      role: 'Customer',
      pharmacy: pharmacy1._id,
      branch: branch1_1._id,
      assignedBranches: [branch1_1._id],
      phone: '+1 555 9988'
    });

    console.log('📦 Creating Categories & Suppliers...');

    const categoryNames = [
      'Tablets',
      'Capsules',
      'Syrups',
      'Injections',
      'Creams',
      'Eye Drops',
      'Baby Care',
      'Surgical Items',
      'Vitamins',
      'Cosmetics',
      'Medical Equipment'
    ];

    const categoryMap1 = {};
    for (const name of categoryNames) {
      categoryMap1[name] = await Category.create({ name, pharmacy: pharmacy1._id });
      await Category.create({ name, pharmacy: pharmacy2._id });
    }

    const supplier1 = await Supplier.create({
      company: 'PharmaCorp Global Ltd',
      name: 'Alex Rivera',
      taxId: 'NTN-892019',
      email: 'orders@pharmacorp.com',
      phone: '+1 888 123 4567',
      address: '900 Logistics Way, Industrial Hub',
      rating: 5,
      pharmacy: pharmacy1._id
    });

    console.log('💊 Seeding 50 Distinct Products with 50 Stock Quantity Each...');

    const products50 = [
      { name: 'Paracetamol 500mg Tablets', brand: 'Panadol', generic: 'Paracetamol', cat: 'Tablets', price: 4.50, cost: 2.50, unit: 'Strip', rx: false },
      { name: 'Amoxicillin 500mg Capsules', brand: 'Amoxil', generic: 'Amoxicillin', cat: 'Capsules', price: 12.00, cost: 7.00, unit: 'Pack', rx: true },
      { name: 'Ibuprofen 400mg Tablets', brand: 'Brufen', generic: 'Ibuprofen', cat: 'Tablets', price: 6.00, cost: 3.20, unit: 'Strip', rx: false },
      { name: 'Metformin 500mg Tablets', brand: 'Glucophage', generic: 'Metformin HCl', cat: 'Tablets', price: 8.50, cost: 4.50, unit: 'Pack', rx: true },
      { name: 'Atorvastatin 20mg Tablets', brand: 'Lipitor', generic: 'Atorvastatin', cat: 'Tablets', price: 25.00, cost: 15.00, unit: 'Pack', rx: true },
      { name: 'Omeprazole 20mg Capsules', brand: 'Prilosec', generic: 'Omeprazole', cat: 'Capsules', price: 10.00, cost: 5.50, unit: 'Pack', rx: false },
      { name: 'Azithromycin 500mg Tablets', brand: 'Zithromax', generic: 'Azithromycin', cat: 'Tablets', price: 18.00, cost: 10.00, unit: 'Pack', rx: true },
      { name: 'Ciprofloxacin 500mg Tablets', brand: 'Cipro', generic: 'Ciprofloxacin', cat: 'Tablets', price: 14.00, cost: 8.00, unit: 'Pack', rx: true },
      { name: 'Losartan 50mg Tablets', brand: 'Cozaar', generic: 'Losartan Potassium', cat: 'Tablets', price: 11.50, cost: 6.00, unit: 'Pack', rx: true },
      { name: 'Amlodipine 5mg Tablets', brand: 'Norvasc', generic: 'Amlodipine Besylate', cat: 'Tablets', price: 9.00, cost: 4.80, unit: 'Pack', rx: true },
      { name: 'Cetirizine 10mg Tablets', brand: 'Zyrtec', generic: 'Cetirizine HCl', cat: 'Tablets', price: 5.50, cost: 2.80, unit: 'Strip', rx: false },
      { name: 'Loratadine 10mg Tablets', brand: 'Claritin', generic: 'Loratadine', cat: 'Tablets', price: 6.50, cost: 3.50, unit: 'Strip', rx: false },
      { name: 'Levothyroxine 50mcg Tablets', brand: 'Synthroid', generic: 'Levothyroxine Sodium', cat: 'Tablets', price: 15.00, cost: 8.50, unit: 'Bottle', rx: true },
      { name: 'Pantoprazole 40mg Tablets', brand: 'Protonix', generic: 'Pantoprazole Sodium', cat: 'Tablets', price: 13.00, cost: 7.20, unit: 'Pack', rx: true },
      { name: 'Montelukast 10mg Tablets', brand: 'Singulair', generic: 'Montelukast Sodium', cat: 'Tablets', price: 20.00, cost: 11.00, unit: 'Pack', rx: true },
      { name: 'Cough Relief Syrup 120ml', brand: 'Benadryl', generic: 'Diphenhydramine Syrup', cat: 'Syrups', price: 7.00, cost: 3.80, unit: 'Bottle', rx: false },
      { name: 'Paracetamol Pediatric Syrup', brand: 'Calpol', generic: 'Paracetamol Suspension', cat: 'Syrups', price: 5.00, cost: 2.60, unit: 'Bottle', rx: false },
      { name: 'Multivitamin Liquid 200ml', brand: 'Pharmaton', generic: 'Multivitamin Complex', cat: 'Syrups', price: 12.50, cost: 6.80, unit: 'Bottle', rx: false },
      { name: 'Antacid Gel 200ml', brand: 'Gaviscon', generic: 'Sodium Alginate Antacid', cat: 'Syrups', price: 9.50, cost: 5.00, unit: 'Bottle', rx: false },
      { name: 'Azithromycin Oral Suspension', brand: 'Zithro-Susp', generic: 'Azithromycin Liquid', cat: 'Syrups', price: 14.50, cost: 8.00, unit: 'Bottle', rx: true },
      { name: 'Insulin Glargine SoloStar Pen', brand: 'Lantus', generic: 'Insulin Glargine 100IU', cat: 'Injections', price: 45.00, cost: 30.00, unit: 'Pen', rx: true },
      { name: 'Ceftriaxone 1g Injection', brand: 'Rocephin', generic: 'Ceftriaxone Sodium', cat: 'Injections', price: 16.00, cost: 9.50, unit: 'Vial', rx: true },
      { name: 'Diclofenac 75mg Ampoule', brand: 'Voltarol', generic: 'Diclofenac Injection', cat: 'Injections', price: 8.00, cost: 4.00, unit: 'Ampoule', rx: true },
      { name: 'Tramadol 50mg Injection', brand: 'Ultram-Inj', generic: 'Tramadol HCl', cat: 'Injections', price: 10.00, cost: 5.50, unit: 'Ampoule', rx: true },
      { name: 'Vitamin B12 1000mcg Injection', brand: 'Neurobion', generic: 'Cyanocobalamin', cat: 'Injections', price: 12.00, cost: 6.50, unit: 'Ampoule', rx: false },
      { name: 'Hydrocortisone Cream 1%', brand: 'Cortizone', generic: 'Hydrocortisone', cat: 'Creams', price: 6.50, cost: 3.20, unit: 'Tube', rx: false },
      { name: 'Clotrimazole Anti-Fungal Cream', brand: 'Canesten', generic: 'Clotrimazole 1%', cat: 'Creams', price: 8.00, cost: 4.20, unit: 'Tube', rx: false },
      { name: 'Diclofenac Pain Relief Gel', brand: 'Voltarol Gel', generic: 'Diclofenac Gel 50g', cat: 'Creams', price: 11.00, cost: 6.00, unit: 'Tube', rx: false },
      { name: 'Fusidic Acid Antibiotic Cream', brand: 'Fucidin', generic: 'Fusidic Acid 2%', cat: 'Creams', price: 13.50, cost: 7.50, unit: 'Tube', rx: true },
      { name: 'Burn Relief Soothing Gel', brand: 'Burnol', generic: 'Aminacrine + Cetrimide', cat: 'Creams', price: 5.50, cost: 2.80, unit: 'Tube', rx: false },
      { name: 'Tobramycin Eye Drops 5ml', brand: 'Tobrex', generic: 'Tobramycin 0.3%', cat: 'Eye Drops', price: 9.00, cost: 4.80, unit: 'Dropper', rx: true },
      { name: 'Artificial Tears Lubricant Drops', brand: 'Refresh', generic: 'Carboxymethylcellulose', cat: 'Eye Drops', price: 10.50, cost: 5.50, unit: 'Dropper', rx: false },
      { name: 'Timolol Glaucoma Drops 0.5%', brand: 'Timoptic', generic: 'Timolol Maleate', cat: 'Eye Drops', price: 14.00, cost: 7.80, unit: 'Dropper', rx: true },
      { name: 'Ciprofloxacin Ophthalmic Drops', brand: 'Ciloxan', generic: 'Ciprofloxacin 0.3%', cat: 'Eye Drops', price: 8.50, cost: 4.50, unit: 'Dropper', rx: true },
      { name: 'Baby Rash Relief Zinc Cream', brand: 'Desitin', generic: 'Zinc Oxide 40%', cat: 'Baby Care', price: 9.00, cost: 4.80, unit: 'Tube', rx: false },
      { name: 'Pediatric Electrolyte Solution', brand: 'Pedialyte', generic: 'Oral Rehydration Salts', cat: 'Baby Care', price: 6.00, cost: 3.00, unit: 'Bottle', rx: false },
      { name: 'Baby Gripe Water 120ml', brand: 'Woodward', generic: 'Dill Seed Oil + Sodium Bicarb', cat: 'Baby Care', price: 7.50, cost: 3.90, unit: 'Bottle', rx: false },
      { name: 'Gentle Baby Lotion 200ml', brand: 'Johnson Baby', generic: 'Hypoallergenic Lotion', cat: 'Baby Care', price: 8.50, cost: 4.20, unit: 'Bottle', rx: false },
      { name: 'Sterilized Gauze Bandage 4x4', brand: 'Steri-Gauze', generic: 'Cotton Gauze Pads', cat: 'Surgical Items', price: 4.00, cost: 1.80, unit: 'Box', rx: false },
      { name: 'Surgical Protective Mask 50s', brand: 'SafeMask', generic: '3-Ply Surgical Mask', cat: 'Surgical Items', price: 8.00, cost: 3.50, unit: 'Box', rx: false },
      { name: 'Sterile Latex Gloves 100s', brand: 'MedGlove', generic: 'Powder-Free Gloves', cat: 'Surgical Items', price: 15.00, cost: 8.00, unit: 'Box', rx: false },
      { name: 'Digital Clinical Thermometer', brand: 'Omron Temp', generic: 'Digital Thermometer', cat: 'Surgical Items', price: 12.00, cost: 6.00, unit: 'Piece', rx: false },
      { name: 'Vitamin C 1000mg Effervescent', brand: 'Redoxon', generic: 'Ascorbic Acid 1000mg', cat: 'Vitamins', price: 9.00, cost: 4.50, unit: 'Tube', rx: false },
      { name: 'Vitamin D3 5000IU Softgels', brand: 'NatureMade D3', generic: 'Cholecalciferol', cat: 'Vitamins', price: 16.00, cost: 8.50, unit: 'Bottle', rx: false },
      { name: 'Calcium + Vitamin D3 Tablets', brand: 'Caltrate', generic: 'Calcium Carbonate + D3', cat: 'Vitamins', price: 14.00, cost: 7.00, unit: 'Bottle', rx: false },
      { name: 'Omega-3 Fish Oil 1000mg', brand: 'SevenSeas', generic: 'EPA + DHA Fatty Acids', cat: 'Vitamins', price: 18.50, cost: 9.80, unit: 'Bottle', rx: false },
      { name: 'Dermatological Sunscreen SPF 50+', brand: 'LaRoche-Posay', generic: 'Broad Spectrum SPF50', cat: 'Cosmetics', price: 28.00, cost: 16.00, unit: 'Tube', rx: false },
      { name: 'Hydrating Gentle Facial Cleanser', brand: 'CeraVe', generic: 'Ceramide Cleanser 236ml', cat: 'Cosmetics', price: 22.00, cost: 12.00, unit: 'Bottle', rx: false },
      { name: 'Automatic Blood Pressure Monitor', brand: 'Omron M3', generic: 'Upper Arm BP Monitor', cat: 'Medical Equipment', price: 65.00, cost: 40.00, unit: 'Unit', rx: false },
      { name: 'Fingertip Pulse Oximeter', brand: 'Beurer Oxi', generic: 'SpO2 Oxygen Sensor', cat: 'Medical Equipment', price: 35.00, cost: 18.00, unit: 'Unit', rx: false }
    ];

    const expFar = new Date();
    expFar.setFullYear(expFar.getFullYear() + 2);

    for (let i = 0; i < products50.length; i++) {
      const p = products50[i];
      const indexNum = (i + 1).toString().padStart(3, '0');
      const sku = `SKU-MED-${indexNum}`;
      const barcode = `8901234567${indexNum}`;

      const med = await Medicine.create({
        name: p.name,
        brandName: p.brand,
        genericName: p.generic,
        sku,
        barcode,
        category: categoryMap1[p.cat]._id,
        supplier: supplier1._id,
        strength: p.name.match(/\d+(mg|g|ml|mcg|IU)/i)?.[0] || 'Standard',
        dosageForm: p.unit,
        packSize: 'Standard',
        taxRate: 5,
        rxRequired: p.rx,
        unitPrice: p.price,
        minStock: 10,
        pharmacy: pharmacy1._id
      });

      await Batch.create({
        medicine: med._id,
        pharmacy: pharmacy1._id,
        branch: branch1_1._id,
        batchNumber: `BT-MED-${indexNum}`,
        expiryDate: expFar,
        costPrice: p.cost,
        sellingPrice: p.price,
        mrp: p.price * 1.2,
        quantity: 50,
        rackNumber: `Rack ${String.fromCharCode(65 + (i % 6))}-${(i % 5) + 1}`
      });
    }

    console.log('👨‍👩‍👧 Creating Sample Customer & Sale...');

    const customer1 = await Customer.create({
      name: 'John Doe',
      phone: '+1 555 9988',
      email: 'johndoe@example.com',
      age: 42,
      gender: 'male',
      pharmacy: pharmacy1._id
    });

    const sampleMed = await Medicine.findOne({ sku: 'SKU-MED-001' });
    const sampleBatch = await Batch.findOne({ batchNumber: 'BT-MED-001' });

    await Sale.create({
      invoiceNumber: 'INV-20260729-1001',
      pharmacy: pharmacy1._id,
      branch: branch1_1._id,
      cashier: pharmacist1._id,
      customer: customer1._id,
      patientName: customer1.name,
      patientPhone: customer1.phone,
      doctorName: 'Dr. Robert Smith',
      prescriptionNumber: 'RX-99201',
      items: [
        {
          medicine: sampleMed._id,
          medicineName: sampleMed.name,
          batch: sampleBatch._id,
          batchNumber: sampleBatch.batchNumber,
          quantity: 2,
          unitPrice: sampleMed.unitPrice,
          discount: 0,
          taxRate: 5,
          total: sampleMed.unitPrice * 2 * 1.05
        }
      ],
      subtotal: sampleMed.unitPrice * 2,
      discountAmount: 0,
      taxAmount: sampleMed.unitPrice * 2 * 0.05,
      grandTotal: sampleMed.unitPrice * 2 * 1.05,
      paymentMethod: 'cash',
      status: 'completed'
    });

    console.log('📜 Seeding Sample Prescriptions & AI Interaction Checks...');

    await Prescription.create({
      pharmacy: pharmacy1._id,
      branch: branch1_1._id,
      patientName: customer1.name,
      patientPhone: customer1.phone,
      doctorName: 'Dr. Sarah Smith (Cardiologist)',
      prescriptionUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
      ocrRawText: 'Rx: Amoxicillin 500mg - 1 cap BD x 7 days\nParacetamol 500mg - 1 tab TDS PRN',
      ocrConfidence: 97.2,
      extractedMedicines: [
        {
          medicineName: sampleMed.name,
          strength: '500mg',
          dosageFrequency: '1 cap BD x 7 days',
          quantity: 14,
          unitPrice: sampleMed.unitPrice,
          matchedMedicineId: sampleMed._id
        }
      ],
      drugInteractionAlerts: [
        {
          level: 'MODERATE',
          pair: [sampleMed.name, 'Allopurinol'],
          warningMessage: 'Potential mild skin rash sensitivity alert.'
        }
      ],
      status: 'ocr_completed',
      totalAmount: sampleMed.unitPrice * 14
    });

    console.log('✅ SEED COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();