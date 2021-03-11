import copy
import random
import re
import json
import requests

STATE_DEFAULT = {
    "state": "start",
    "order": []
}

def new_state():
    state = copy.deepcopy(STATE_DEFAULT)
    return state

def interpret_service(interpretor, intent_text):
    route_map = {
        "DefaultInterpreter": "default",
    }

    if interpretor not in route_map:
        raise Exception("not ok")

    route = route_map[interpretor]

    try:
        r = requests.post("http://localhost:5060/{}".format(route),
                            json={"intent_text": intent_text})
        # print('intent_text', intent_text)
    except requests.ConnectionError:
        raise Exception("Error on interpret server connection")

    res = r.json()
    # print('res', res)
    return res
