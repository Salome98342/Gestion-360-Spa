from rest_framework.permissions import BasePermission
from apps.tenants.models import Membership


def is_company_manager(user, company):
    return user.is_authenticated and (user.is_staff or Membership.objects.filter(company=company, user=user, is_active=True, role__in=[Membership.Role.OWNER, Membership.Role.MANAGER]).exists())


class IsCompanyManager(BasePermission):
    def has_permission(self, request, view):
        return is_company_manager(request.user, view.get_company())
