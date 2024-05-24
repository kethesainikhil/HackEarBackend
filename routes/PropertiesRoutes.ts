import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono'
import {Resend} from "resend"
type Bindings = {
    DATABASE_URL: string,
    RESEND_API : string
  }
  
  const app = new Hono<{ Bindings: Bindings }>()


  app.get('/getProperties/:id', async (c) => {
    const id = parseInt(c.req.param("id"));
    
    const prisma = new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate())
    try{

    const property = await prisma.properties.findMany({
        where: {
          userId : id
        }
      })
      return c.json(property)
    }
    catch(err){
        c.status(404)
      c.json({message:"no properites found"})
    }
  })
  app.get('/getPropertiesById/:id', async (c) => {
    const id = parseInt(c.req.param("id"));
    
    const prisma = new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate())
    try{
    const property = await prisma.properties.findUnique({
        where: {
          id : id
        }
      })
      return c.json(property)
    }
    catch(err){
        c.status(404)
      c.json({message:"no properites found"})
    }
  })
  app.post('/addProperty/:id', async (c) => {

    const id = parseInt(c.req.param("id"));
    const body: {
        place: string,
        area :string,
        bedrooms: string,
        price: string,
        bathrooms:string,
        imageUrl?: string
    }  = await c.req.json()
    const prisma = new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate())
    try{
    const property = await prisma.properties.create({
        data:{
          place: body.place,
          area: body.area,
          bedrooms:parseInt(body.bedrooms),
          price: parseInt(body.price),
          bathrooms: parseInt(body.bathrooms),
          userId : id,
          imageUrl: body.imageUrl
        }
      })
      return c.json(property)
    }
    catch(err){
        c.status(404)
      return c.json({err:err})
    }
  })
  app.get('/getAllProperties', async (c) => {

    const prisma = new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate())  
    try{

    const properties = await prisma.properties.findMany()
    return c.json(properties)
    }
    catch(err){
        c.status(404)
      c.json({message:"no properites found"})
    }
  })
  app.patch('/updateProperty/:id', async (c) => {

    const id = parseInt(c.req.param("id"));
    const body: {
        place?: string,
        area? :string,
        bedrooms?: number,
        price?: number,
        bathrooms?:number,
        imageUrl?: string,
        likes? : string,
    }  = await c.req.json()
    const prisma = new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate())
    try{
      if(body.likes){
        const property = await prisma.properties.update({
          where: {
            id
          },
          data:{
            likes: {increment: parseInt(body.likes)} 
          }
        })
        return c.json(property)

      }
      else{
        const property = await prisma.properties.update({
          where: {
            id
          },
          data:{
            place:body.place,
            bathrooms:body.bathrooms,
            bedrooms:body.bedrooms,
            imageUrl:body.imageUrl,
            area:body.area,
            price:body.price
          }
        })
        return c.json(property)
      }

    
    
    }
    catch(err){
        c.status(404)
        return c.json({err:err})
    }
  })
  app.delete('/deleteProperty/:id', async (c) => {
    const id = parseInt(c.req.param("id"));
    const prisma = new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate())
    try{

    const property = await prisma.properties.delete({
        where: {
           id
        },
      })
      return c.json(property)
    }
    catch(err){
        c.status(404)
    }
  })
  app.post("/sendEmail", async (c) => {
    const resend = new Resend(c.env.RESEND_API);
    const prisma = new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate())
    const body: {
      buyerId:string,
      sellerId:string,
      propertyId:string
    } = await c.req.json()
    try{
      const buyer : any = await prisma.user.findUnique({
        where: {
          id: parseInt(body.buyerId)
        },
        select: {
          email: true,
          phone:true,
          firstName:true,
          lastName:true,
        }
      })
      const seller : any = await prisma.user.findUnique({
        where: {
          id: parseInt(body.sellerId)
        },
        select: {
          email: true,
          phone:true,
          firstName:true,
          lastName:true,
        }
      })

      const property = await prisma.properties.findUnique({
        where: {
          id: parseInt(body.propertyId)
        }
      })
      const { data, error } = await resend.emails.send({
        from: "nikhilkethe@kethesainikhil.online",
        to: [buyer?.email],
        subject: "Seller Details",
        html: `<strong>Hey!!! Thank you for showing interest in the property here are the Seller Details</strong> <br /> Email: ${seller.email} <br/> Firstname: ${seller.firstName} <br /> Lastname: <br/>${seller.lastName} <br/> Phone: ${seller.phone}  <br/> <strong>Here are the Property details: <br /> Place: ${property?.place} <br />  Area: ${property?.area} <br/> Price: ${property?.price} <br/> Bedrooms: ${property?.bedrooms} <br/> Bathrooms: ${property?.bathrooms} `,
      });
       await resend.emails.send({
        from: "nikhilkethe@kethesainikhil.online",
        to: [seller?.email],
        subject: "Buyer Details",
        html: `<strong>Hey!!! One of the Buyer showed interest in your Property here are the Buyer Details</strong> <br /> Email: ${buyer.email} <br/> Firstname: ${buyer.firstName} <br /> Lastname: <br/>${buyer.lastName} <br/> Phone: ${buyer.phone}  <br/> Here are the Property details: <br/> Place: ${property?.place} <br />  Area: ${property?.area} <br/> Price: ${property?.price} <br/> Bedrooms: ${property?.bedrooms} <br/> Bathrooms: ${property?.bathrooms} `,
      });
    return c.json({msg:"Sent mail to the both the buyer and sender"})
    }
    catch(error){
      return c.json({error:error})
    }
    
  });
  export default app