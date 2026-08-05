from django.urls import path
from . import views

urlpatterns = [
    path("public/<slug:company_slug>/", views.PublicCompanyView.as_view()),
    path("public/<slug:company_slug>/services/", views.PublicServicesView.as_view()),
    path("public/<slug:company_slug>/staff/", views.PublicStaffView.as_view()),
    path("public/<slug:company_slug>/appointments/", views.PublicAppointmentsView.as_view()),
    path("companies/<slug:company_slug>/services/", views.ManagerServicesView.as_view()),
    path("companies/<slug:company_slug>/services/<int:pk>/", views.ManagerServiceDetailView.as_view()),
    path("companies/<slug:company_slug>/staff/", views.ManagerStaffView.as_view()),
    path("companies/<slug:company_slug>/appointments/", views.ManagerAppointmentsView.as_view()),
    path("companies/<slug:company_slug>/appointments/<int:pk>/", views.ManagerAppointmentDetailView.as_view()),
    path("provider/companies/", views.ProviderCompaniesView.as_view()),
    path("provider/licenses/", views.ProviderLicensesView.as_view()),
    path("provider/licenses/<int:pk>/", views.LicenseDetailView.as_view()),
]
