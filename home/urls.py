from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('api-auth/', include('rest_framework.urls')),
    path('rest-auth/', include('rest_auth.urls')),
    path('rest-auth/registration/', include('rest_auth.registration.urls')),
    path('admin/', admin.site.urls),
    path('api/', include('core.api.urls')),
]


#made at https://youtu.be/0JOl3ckfGAM?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=118
if settings.DEBUG:
    #lets the app access pictures from the media_url found in settings.py
    urlpatterns += static( settings.MEDIA_URL, document_root=settings.MEDIA_ROOT )


if not settings.DEBUG:
    urlpatterns += [     re_path(r'^.*', TemplateView.as_view(template_name='index.html'))    ]
