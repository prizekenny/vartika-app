import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import fs from 'fs';

// 获取当前文件的目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载.env文件
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env file found. Using default environment variables.');
  dotenv.config();
}

// 从环境变量获取数据库连接信息
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME || 'vartika_portal_db';

// 如果没有设置密码，打印警告
if (!DB_PASSWORD) {
  console.warn('警告: 未找到数据库密码。请确保设置了DB_PASSWORD环境变量。');
}

console.log(`数据库连接信息: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

// SQL脚本路径
const scriptsPath = path.join(__dirname, '..', 'database');

// 创建一个命令执行函数，使用相同的环境变量
function executeCmd(command) {
  console.log(`执行命令: ${command}`);
  try {
    return execSync(command, { 
      stdio: 'inherit',
      env: { 
        ...process.env,
        PGPASSWORD: DB_PASSWORD // 使用环境变量中的密码
      }
    });
  } catch (error) {
    console.error(`命令执行失败: ${error.message}`);
    throw error;
  }
}

// 主函数
async function main() {
  console.log('===== Vartika Database Setup =====');
  
  try {
    // 1. 创建数据库（如果不存在）
    try {
      console.log('\n创建数据库（如果不存在）...');
      executeCmd(`psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -f ${scriptsPath}/create_db.sql`);
    } catch (error) {
      console.error('创建数据库错误:', error.message);
    }

    // 2. 创建表结构
    try {
      console.log('\n创建表结构...');
      executeCmd(`psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -f ${scriptsPath}/schema.sql`);
    } catch (error) {
      console.error('创建表结构错误:', error.message);
      process.exit(1); // 如果表结构创建失败，退出程序
    }

    // 输出脚本参数帮助信息
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) {
      console.log('\n用法: node db-setup.js [选项]');
      console.log('\n选项:');
      console.log('  --data, -d     加载测试数据');
      console.log('  --help, -h     显示帮助信息');
      process.exit(0);
    }

    // 3. 加载测试数据（如果指定了--data选项）
    if (args.includes('--data') || args.includes('-d')) {
      try {
        console.log('\n加载测试用户数据...');
        executeCmd(`psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -f ${scriptsPath}/user_test.sql`);
        
        console.log('\n加载测试客户数据...');
        executeCmd(`psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -f ${scriptsPath}/create_clients.sql`);
        
        console.log('\n设置令牌表...');
        executeCmd(`psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -f ${scriptsPath}/create_token_db.sql`);
        
        console.log('\n设置用户日志表...');
        executeCmd(`psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -f ${scriptsPath}/create_user_log.sql`);
      } catch (error) {
        console.error('加载测试数据错误:', error.message);
      }
    }

    console.log('\n===== 数据库设置完成 =====');
    console.log('要加载测试数据，请运行: node db-setup.js --data');
  } finally {
    // 不需要清除环境变量中的密码，因为它是从.env文件中读取的
    console.log('数据库设置脚本执行完毕');
  }
}

// 运行主函数
main().catch(error => {
  console.error('意外错误:', error);
  process.exit(1);
});
