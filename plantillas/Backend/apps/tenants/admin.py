from django.contrib import admin
from .models import Company, License, Membership
admin.site.register([Company, License, Membership])
