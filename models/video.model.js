import mongoose ,{Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';


const videoSchema = new Schema({
    title: {
        type: String,
        required: true,     
        trim: true,
    },
    description: {      
        type: String,
        required: true,     
    },  
    videoFile: {  
        type: String, // cloudinary url video file
        required: true,
    },
    thumbnail: {
        type: String, // cloudinary url thumbnail image
        required: true, 
    },
    duration: {
        type: Number, // duration in seconds, cludinary provides duration metadata
        required: true, 
    },
    views: {
        type: Number,
        default: 0,     
    },
    isPublished: {
        type: Boolean,
        default: true, 
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },


}, {timestamps: true});


videoSchema.plugin(mongooseAggregatePaginate);

const Video = mongoose.model('Video', videoSchema);


//COLLECTION NAME MONGOOSE WILL CREATE plural form 'videos' IN MONGODB DATABASE
// LIKE -> Video -----> videos 
// automatically handled by mongoose