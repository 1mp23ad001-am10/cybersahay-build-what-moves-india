import os,tempfile,glob,site
_site=site.getusersitepackages()
for _dll in glob.glob(os.path.join(_site,'nvidia','*','bin')):
    os.add_dll_directory(_dll)
    os.environ['PATH']=_dll+os.pathsep+os.environ.get('PATH','')
from fastapi import FastAPI,UploadFile,File,Query
from faster_whisper import WhisperModel
app=FastAPI(title='Build What Moves India local ASR')
device=os.getenv('WHISPER_DEVICE','cpu'); compute=os.getenv('WHISPER_COMPUTE','int8')
# Small is the practical local-quality floor for Hindi and Kannada.
model_name=os.getenv('WHISPER_MODEL','small')
quality_model=WhisperModel(model_name,device=device,compute_type=compute,num_workers=2)
@app.post('/transcribe')
async def transcribe(file:UploadFile=File(...),lang:str=Query('en')):
    with tempfile.NamedTemporaryFile(delete=False,suffix='.webm') as f:f.write(await file.read());path=f.name
    try:
        code=lang.split('-')[0]
        if code not in {'en','hi','kn'}:
            return {'detail':'Voice input currently supports English, Hindi, and Kannada.'}
        model=quality_model
        try:
            seg,info=model.transcribe(path,language=code,beam_size=1,best_of=1,temperature=0,condition_on_previous_text=False,vad_filter=True)
            return {'text':' '.join(x.text.strip() for x in seg),'language':info.language}
        except RuntimeError as error:
            # A CUDA model can initialise successfully yet fail later when the
            # host lacks matching cuBLAS/cuDNN DLLs. Retry the same request on
            # CPU instead of making the citizen lose their voice input.
            if 'cublas' not in str(error).lower() and 'cudnn' not in str(error).lower():
                raise
            fallback=WhisperModel(model_name,device='cpu',compute_type='int8',num_workers=2)
            seg,info=fallback.transcribe(path,language=code,beam_size=1,best_of=1,temperature=0,condition_on_previous_text=False,vad_filter=True)
            return {'text':' '.join(x.text.strip() for x in seg),'language':info.language,'fallback':'cpu'}
    finally:os.unlink(path)
