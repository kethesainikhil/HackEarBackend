import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono'

type Bindings = {
    DATABASE_URL: string
  }
  
  const app = new Hono<{ Bindings: Bindings }>()

app.post('/signUp', async (c) => {
    const body: {
      firstName: string
      lastName: string
      email: string
      password: string
      phone: string
    } = await c.req.json()
    const prisma = new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate())
    try{
      const findUser = await prisma.user.findFirst({
        where: {
          email: body.email
        }
      })
      if(findUser){
        return c.json({error:"user with email address already exists"})
      }
      const phone = await prisma.user.findFirst({
        where: {
          phone: body.phone
        }
      })
      if(phone){
        return c.json({error:"user with phone number already exists"})
      }
      else{
        const user = await prisma.user.create({
          data: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            password: body.password,
            phone: body.phone
          }
          ,
          select:{
            id:true,
            email:true
          }
        })
        return c.json(user)
      }
    }
    catch(err){
      return c.json({
        error: err
      })
    }
  })
  app.post('/login', async (c) => {
    const body: {
      email: string
      password: string
    } = await c.req.json()
   try{
    const prisma = new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate())
    const email = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
      select : {
        id : true,
        email:true
      }
    })
    if(!email){
      return c.json({
        error: "Email not found"
      })
    }
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: body.password
      },
      select : {
        id : true
      }
    })
    if(!user){
      return c.json({
        error: "Invalid credentials"
      })
    }
    return c.json(user)
   }
   catch(err){
    return c.json({
      error: err
    })
   }
  })

  export default app;