import jwt from "jsonwebtoken"



export const authentication = (req, res, next)=>{

	const tokenHeader = req.headers["authorization"];
	
	if(!tokenHeader){
		res.status(404).send({message:"Unauthorized Login attempt"})
	}

	if(!tokenHeader.startsWith("Bearer")){
		return res.status(401).json({message: "Bearer token misssing"})
	}
	const token = tokenHeader.split(" ")[1];

	try{

		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		req.user = decoded
		next();
	}
	catch(err)
	{
		res.send({message:"Error occured while logging"}).status(404);
	}

}