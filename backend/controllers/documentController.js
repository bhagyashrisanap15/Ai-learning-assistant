import document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import {extractTextFromPDF} from '../utils/pdfParser.js';
import {chunkText} from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';


export const uploadDocument = async (req,res,next) => {
    try{
         
    }catch (error) {
        if(req.file){
            await fs.unlink(req.file.path).catch(() => {});
        }
        next (error);
    }
};

export const getDocuments = async (req,res,next) => {

};

export const getDocument = async (req,res,next) => {

};

export const deleteDocument = async (req,res,next) => {

};

export const updateDocument = async (req,res,next) => {
    
}