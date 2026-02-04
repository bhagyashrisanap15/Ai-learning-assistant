import document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import {extractTextFromPDF} from '../utils/pdfParser.js';
import {chunkText} from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';


export const uploadDocument = async (req,res,next) => {
    try{
         if(!req.file){
            return res.status(400).json({
                success:false,
                error:"Please upload a PDF file",
                statusCode:400
            });
         }

         const {title} = req.body;

         if(!title) {
            await fs.unlike(req.file.path);
            return res.status(400).json({
                success:false,
                error:"Please provide a document title",
                statusCode :400
            });
         }
        const baseUrl =`http://localhost:${process.env.PORT || 8000}`;
        const fileUrl =`${baseUrl}/uploads/documents/${req.file.filename}`;

        const document = await Document.create({
            userId:req.user._id,
            title,
            fileName:req.file.originalname,
            filePath:fileUrl,
            fileSize:req.file.size,
            status:'processing'
        });

        processPDF(document._id,req,file.path).catch(err => {
            console.error('PDF processing error:',err);
        });

        res.status(201).json({
            success:true,
            data:document,
            message:'Document uploaded successfully. Processing in progress...'
        });
    } catch (error) {
        if(req.file){
            await fs.unlink(req.file.path).catch(() => {});
        }
        next (error);
    }
};

const processPDF = async (documentId, filePath) => {
    try{
        const{text} = await extractTextFromPDF(filePath);

        const chunks = chunksText(text,500,50);

        await Document.findByAndUpdate(documentId, {
            extractedText:text,
            chunks:chunks,
            status:'ready'
        });

        console.log(`document ${documentId} processed successfully`);
    } catch (error){
        console.error(`Error processing document ${documentId}`,error);

        await Document.findByAndUpdate(documentId, {
            status:'failed'
        });
    }
};


export const getDocuments = async (req,res,next) => {
 try{
       const documents = await Document.aggregate([
        {
            $match:{userId : new mongoose.Types.OjectId(req.user._1)}
        },
        {
            $lookup:{
                from:'flashcards',
                localField:'_id',
                foreignField:'documentId',
                as:'flashcardSets'
            }
        },
        {
            $lookup:{
                from:'quizzes',
                localField:'_id',
                foreignField:'documentId',
                as:'quizzes'
            }
        },
        {
            $addFields: {
                flashcardCount:{$size:'$flashcardSets'},
                quizCount:{$size:'$quizzes'}
            }
        },
        {
            $project:{
                extractedText:0,
                chunks:0,
                flashcardSets:0,
                quizzes:0
            }
        },
        {
            $sort:{ uploadDate:-1}
        }
       ]);
       res.status(200).json({
        success:true,
        count:document.length,
        data:documents
       });
    }catch (error) {
        next (error);
    }
};


export const getDocument = async (req,res,next) => {
 try{
         
    }catch (error) {
       
        next (error);
    }
};

export const deleteDocument = async (req,res,next) => {
 try{
         
    }catch (error) {
       
        next (error);
    }
};

export const updateDocument = async (req,res,next) => {
    try{
         
    }catch (error) {
       
        next (error);
    } 
}