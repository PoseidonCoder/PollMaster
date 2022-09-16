from dotenv import load_dotenv
load_dotenv()

import os
import discord
import disnake
from disnake.ext import commands
from disnake import TextInputStyle
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import atexit
from bson.objectid import ObjectId

cluster = MongoClient(os.getenv('MONGODB_URI'), server_api=ServerApi('1'))
db = cluster.PollMaster
polls = db.polls

class PollButton(disnake.ui.Button['PollMaster']):
    def __init__(self, poll, name):
        self.id = poll['_id']
        self.name = name
    
        super().__init__(style=disnake.ButtonStyle.primary, label=self.update(), custom_id=f'persistent_view:{name}')

    def update(self):
        poll = polls.find_one({'_id': ObjectId(self.id)})

        votes = len(poll['options'][self.name])
        self.label = f'{self.name} [{str(votes)}]'
        return self.label

    async def callback(self, inter: disnake.MessageInteraction):
        poll = polls.find_one({'_id': ObjectId(self.id)})

        for option in poll['options'].keys():
            voters = poll['options'][option]
            if inter.author.name in voters:
                nested = 'options.' + option
                polls.find_one_and_update({"_id": ObjectId(self.id)}, {'$pull': {nested: inter.author.name}})
                self.view.buttons[option].update()

        nested = 'options.' + self.name
        polls.find_one_and_update({"_id": ObjectId(self.id)}, {'$push': {nested: inter.author.name}})
        
        self.update()

        await inter.response.edit_message(content=poll['title'], view=self.view)

class Poll(disnake.ui.View):
    def __init__(self, poll):
        super().__init__(timeout=None)

        self.buttons = {}

        for option in poll['options']:
            self.buttons[option] = PollButton(poll, option)
            print(self.buttons[option])
            self.add_item(self.buttons[option])

            print(self.buttons)


class PollMasterBot(commands.Bot):
    def __init__(self):
        super().__init__(command_prefix=commands.when_mentioned)
        self.persistent_views_added = False

    async def on_ready(self):
        if not self.persistent_views_added:
            # self.add_view(Poll())
            self.persistent_views_added = False

        print(f"Logged in as {self.user} (ID: {self.user.id})")
        print("------")



bot = PollMasterBot()

@bot.slash_command(description="Displays your poll")
async def poll(inter: disnake.AppCmdInter, id):
    poll = polls.find_one({'_id': ObjectId(id)})
    await inter.send(poll['title'], view=Poll(poll))

try:
    bot.run(os.getenv("BOT_TOKEN"))
except discord.HTTPException as e:
    if e.status == 429:
        print("The Discord servers denied the connection for making too many requests")
        print("Get help from https://stackoverflow.com/questions/66724687/in-discord-py-how-to-solve-the-error-for-toomanyrequests")
    else:
        raise e

@atexit.register
def shutdown_db_cluster():
    cluster.close()
