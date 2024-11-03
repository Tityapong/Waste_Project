import { db } from "./dbConfig";
import { Notifications, Transactions, Users } from "./schema";
import {eq,sql,and,desc }from 'drizzle-orm'

// Create a new user
export async function createUser(email:string, name:string){
    try{
        const [user]=await db.insert(Users).values({email,name}).returning().execute();
        return user;

    }catch(error){
        console.error('Error creating user',error);
        return null
    }
}

export async function getUserByEmail(email:string){
    try{
        const [user] =await db.select().from(Users).where(eq(Users.email,email)).execute()
        return user;

    }catch(error){
        console.error('Error fetching user by email',error);
        return null
    }
}

export async function getUnreadNotifications(userId:number){
    try{
      return await db.select().from(Notifications).where(and(eq(Notifications.userId,userId),eq(Notifications.isRead,false))).execute()

    }catch(error){
        console.error('Error fetching unread notifications',error);
        return null
    }
}

///get user balance

export async function getUserBalance(userId:number):Promise<number>{
    const transactions= await getRewardTransaction(userId) || [];
    if(!transactions) return 0;
    const balance=transactions.reduce((acc:number,transactions:any)=>{
        return transactions.type.startsWith('earned')? acc+ transactions.amount: acc- transactions.amount
    },0)
    return Math.max(balance,0)


}

export async function getRewardTransaction(userId:number){
    try{
        const transactions=await db.select({
            id:Transactions.id,
            type:Transactions.type,
            amount:Transactions.amount,
            description:Transactions.description,
            date: Transactions.date,
        }).from(Transactions).where(eq(Transactions.userId,userId)).orderBy(desc(Transactions.date)).limit(10).execute()

        const formattedTransaction=transactions.map(t=>({
            ...t,
            date:t.date.toISOString().split('T')[0]
        }))
        return formattedTransaction;


    }catch(error){
        console.error('Error fetching reward transactions',error);
        return null
    }
}
