from django.shortcuts import render


from django.core.handlers.wsgi import WSGIRequest

import google.generativeai as genai
import os
from pathlib import Path
import random

DATA_PATH = Path(__file__).parent / "data"

gemini_chat = None

# Create your views here.

def home_page(request:WSGIRequest):

    return render(request=request, template_name="base.html", context={})

def search_query(request:WSGIRequest):

    question = request.POST.get("query")

    ai_response = get_answer_from_gemini(question)
    response = render(request=request,template_name="partials/new_chat_row.html",context={"answer":ai_response})
    
    return response

    
def build_gemini_model():
    global gemini_chat

    genai.configure(api_key=os.environ.get("GOOGLE_API_KEY_1"))

    # for model in genai.list_models():
    #     print(f"Model Name: {model.name}")
    #     print(f"  Supported Methods: {model.supported_generation_methods}")
    #     print("-" * 20)

    csv_file = genai.upload_file(
                path=DATA_PATH / "Indian_Student_Career_Outcomes.csv",
                mime_type="text/csv")




    # --- System Instructions ---
    system_instructions = """
    You are a specialized AI assistant created to help parents and students make informed decisions about higher education in India. 
    Your entire knowledge base is the Indian_Student_Career_Outcomes.csv dataset.
    you can accept the csv file for the first time. 
    Your goal is to answer any questions accurately based ONLY on the provided data. Do not invent information or use external knowledge.
    Your tone should be helpful, clear, and data-driven.
    When a user asks a vague question like 'What is the best university?', you must ask for clarification on what 'best' means to them (e.g., highest salary, best ROI, job satisfaction).
    Present comparisons in simple tables.
    If you cannot answer a question from the data, clearly state that the information is not available in the dataset.
    return the data in a row-para wise
    """

    # --- Model Selection ---
    model = genai.GenerativeModel(
        'models/gemini-pro-latest',
        system_instruction=system_instructions
    )

    gemini_chat = model.start_chat(history=[])

    gemini_chat.send_message([
        {"file_data": {"mime_type": "text/csv", "file_uri": csv_file.uri}},
        {"text": "Please use the data in this file to answer my questions."}
    ])


def get_answer_from_gemini(question,img=None):  
    global gemini_chat

    # Send a message to the bot
    if not gemini_chat:
        build_gemini_model()
    
    else:
        api_keys_list = [os.environ.get("GOOGLE_API_KEY_1"),os.environ.get("GOOGLE_API_KEY_2")]
        # gets a random api key
        api_key = random.choice(api_keys_list)

        genai.configure(api_key=api_key)


    content = [question]

    try:
        response = gemini_chat.send_message(content)
        return response.text
    
    except Exception as e:
        return str(e)


