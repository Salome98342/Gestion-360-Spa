from django.contrib import admin
from .models import Appointment, Service, StaffMember
admin.site.register([Appointment, Service, StaffMember])
